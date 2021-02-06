import { Coupon } from "@prisma/client";
import { inputObjectType, intArg, list, nonNull, nullable, objectType, queryField, stringArg } from "nexus";
import asyncDelay from "../../utils/asyncDelay";
import getIUser from "../../utils/getIUser";
import salePrice from "../../utils/salePrice";
import { MIN_PAYMENT_PRICE } from "../../values";

export const ItemsCoupons = objectType({
    name: 'ItemsCoupons',
    definition: (t) => {
        t.int('itemId')
        t.list.field('coupon', { type: 'Coupon' })
    }
})

export const OrderCalculateType = objectType({
    name: 'orderCalculateType',
    definition: (t) => {
        t.list.field('orderItems', { type: 'CartItem' }) // 주문 상품
        t.field('user', { type: 'User' }) // 배송지 정보 + 환불계좌 + 포인트 참조용
        t.list.field('itemsCoupons', { type: ItemsCoupons }) // 아이템별 적용가능 쿠폰들
        t.int('totalItemPrice') // 총 상품 금액
        t.int('totalSaledPrice') // 상품 세일 적용 총 금액
        t.int('totalCouponedPrice') // 쿠폰 적용 총 금액
        t.int('totalDeliveryPrice') // 배송비
        t.int('totalExtraDeliveryPrice') // 산간지역 추가 배송비 TODO
        t.int('totalSale') // 상품 할인
        t.int('totalCouponSale') // 쿠폰 할인
        t.int('totalPointSale') // 포인트 할인
        t.int('totalPaymentPrice') // 총 결제 금액
        t.int('maxPointPrice') // 최대 사용가능 포인트
    }
})

// QUERY - 앱 주문/결제 페이지
export const orderCalculate = queryField('orderCalculate', {
    type: OrderCalculateType,
    args: {
        cartItemIds: nonNull(list(intArg())),
        couponIds: nullable(list(nullable(stringArg()))),
        point: nonNull(intArg()),
    },
    resolve: async (_, { cartItemIds, point, couponIds }, ctx) => {
        try {
            await asyncDelay()
            const user = await getIUser(ctx)
            const orderItems = await ctx.prisma.cartItem.findMany({
                where: { id: { in: cartItemIds } },
                include: { item: true }
            })

            const itemsCoupons: { itemId: number, coupons: Coupon[] }[] = []


            let totalItemPrice = 0
            let totalSaledPrice = 0
            let totalCouponedPrice = 0
            let totalDeliveryPrice = 0
            let totalExtraDeliveryPrice = 0

            for (const i in orderItems) {
                const orderItem = orderItems[i]

                const itemPrice = orderItem.item.price * orderItem.num
                totalItemPrice += itemPrice
                const saledPrice = salePrice(orderItem.item.sale, itemPrice)
                totalSaledPrice += saledPrice
                totalDeliveryPrice += orderItem.item.deliveryPrice
                totalExtraDeliveryPrice += orderItem.item.extraDeliveryPrice

                // 쿠폰
                let couponSalePrice = 0
                if (couponIds) {
                    const couponId = couponIds[i]
                    if (couponId) {
                        const coupon = await ctx.prisma.coupon.findUnique({ where: { id: couponId } })
                        if (coupon) {
                            if (coupon.period.getTime() > Date.now()) throw new Error(`기간이 지난 쿠폰 입니다 (${coupon.name})`)
                            if (coupon.minItemPrice && coupon.minItemPrice > totalSaledPrice) throw new Error(`쿠폰 최소 금액보다 상품 가격이 낮습니다 (${coupon.name})`)
                            if (coupon.salePrice) couponSalePrice = couponSalePrice
                            else if (coupon.salePercent) couponSalePrice = saledPrice - salePrice(coupon.salePercent, saledPrice)
                            if (coupon.maxSalePrice) couponSalePrice = couponSalePrice > coupon.maxSalePrice ? coupon.maxSalePrice : couponSalePrice
                        }
                    }
                }
                totalCouponedPrice += saledPrice - couponSalePrice
            }

            const totalSale = totalItemPrice - totalSaledPrice
            const totalCouponSale = totalSaledPrice - totalCouponedPrice
            const totalPaymentPriceWithoutPoint = totalCouponedPrice + totalDeliveryPrice + totalExtraDeliveryPrice
            const maxPointPrice = totalPaymentPriceWithoutPoint < user.point ? totalPaymentPriceWithoutPoint - MIN_PAYMENT_PRICE : user.point
            const totalPointSale = point > maxPointPrice ? maxPointPrice : point
            const totalPaymentPrice = totalPaymentPriceWithoutPoint - totalPointSale



            return {
                orderItems,
                user,
                itemsCoupons,
                totalItemPrice,
                totalSaledPrice,
                totalCouponedPrice,
                totalDeliveryPrice,
                totalExtraDeliveryPrice,
                totalSale,
                totalCouponSale,
                totalPointSale,
                totalPaymentPrice,
                maxPointPrice
            }
        } catch (error) {
            console.error(error)
            throw error
        }
    }
})

// const orderRequest