import { Coupon } from "@prisma/client";
import { inputObjectType, intArg, list, nonNull, nullable, objectType, queryField, stringArg } from "nexus";
import { CartItemOption, ItemOption } from "../../types";
import asyncDelay from "../../utils/asyncDelay";
import getIUser from "../../utils/getIUser";
import salePrice from "../../utils/salePrice";
import { MIN_PAYMENT_PRICE } from "../../values";

export const OrderItemsCoupons = objectType({
    name: 'OrderItemsCoupons',
    definition: (t) => {
        t.nonNull.int('orderItemId')
        t.nonNull.list.field('coupons', { type: 'Coupon' })
    }
})

export const OrderCalculateType = objectType({
    name: 'orderCalculateType',
    definition: (t) => {
        t.nonNull.list.field('orderItems', { type: 'CartItem' }) // 주문 상품
        t.nonNull.field('user', { type: 'User' }) // 배송지 정보 + 환불계좌 + 포인트 참조용
        t.nonNull.list.field('orderItemsCoupons', { type: OrderItemsCoupons }) // 아이템별 적용가능 쿠폰들
        t.nonNull.int('totalItemPrice') // 총 상품 금액
        t.nonNull.int('totalSaledPrice') // 상품 세일 적용 총 금액
        t.nonNull.int('totalCouponedPrice') // 쿠폰 적용 총 금액
        t.nonNull.int('totalDeliveryPrice') // 배송비
        t.nonNull.int('totalExtraDeliveryPrice') // 산간지역 추가 배송비 TODO
        t.nonNull.int('totalSale') // 상품 할인
        t.nonNull.int('totalCouponSale') // 쿠폰 할인
        t.nonNull.int('totalPointSale') // 포인트 할인
        t.nonNull.int('totalPaymentPrice') // 총 결제 금액
        t.nonNull.int('maxPointPrice') // 최대 사용가능 포인트
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

            // 아이템별 적용 가능 쿠폰 리스트 찾기
            const orderItemsCoupons: { orderItemId: number, coupons: Coupon[] }[] = []
            // 가격 계산
            let totalItemPrice = 0
            let totalSaledPrice = 0
            let totalCouponedPrice = 0
            let totalDeliveryPrice = 0
            let totalExtraDeliveryPrice = 0

            for (const i in orderItems) {
                const orderItem = orderItems[i]
                // 옵션 적용 가격
                let optionedPrice = orderItem.item.price // 기본금
                let optionedSaledPrice = salePrice(orderItem.item.sale, orderItem.item.price) // 기본금에 세일 적용
                const itemOption = orderItem.item.option as ItemOption
                const orderItemOption = orderItem.option as CartItemOption
                if (itemOption && orderItemOption) { // 옵션이 있다면 옵션 계산
                    for (const i in itemOption.data) {
                        const optionPrice = itemOption.data[i].optionDetails[orderItemOption.data[i]].price
                        optionedPrice += optionPrice
                        optionedSaledPrice += optionPrice
                    }
                }
                // 수량 적용 가격
                totalItemPrice += optionedPrice * orderItem.num
                // 수량 + 세일 적용 가격
                totalSaledPrice += optionedSaledPrice * orderItem.num
                // 배송비 적용
                totalDeliveryPrice += orderItem.item.deliveryPrice
                if (true /* 산간지역이라면 */) {
                    totalExtraDeliveryPrice += orderItem.item.extraDeliveryPrice
                }
                // 적용가능 쿠폰 리스트 
                const coupons = await ctx.prisma.coupon.findMany({
                    where: {
                        userId: user.id,
                        period: { gt: new Date() },
                        OR: [{ minItemPrice: null }, { minItemPrice: { lte: optionedSaledPrice } }],
                    },
                    orderBy: {
                        period: 'asc'
                    }
                })
                orderItemsCoupons.push({
                    coupons,
                    orderItemId: orderItem.id
                })

                // 쿠폰 적용
                let couponSalePrice = 0
                // if (couponIds) {
                //     const couponId = couponIds[i]
                //     if (couponId) {
                //         const coupon = await ctx.prisma.coupon.findUnique({ where: { id: couponId } })
                //         if (coupon) {
                //             if (coupon.period.getTime() > Date.now()) throw new Error(`기간이 지난 쿠폰 입니다 (${coupon.name})`)
                //             if (coupon.minItemPrice && coupon.minItemPrice > totalSaledPrice) throw new Error(`쿠폰 최소 금액보다 상품 가격이 낮습니다 (${coupon.name})`)
                //             if (coupon.salePrice) couponSalePrice = couponSalePrice
                //             else if (coupon.salePercent) couponSalePrice = saledPrice - salePrice(coupon.salePercent, saledPrice)
                //             if (coupon.maxSalePrice) couponSalePrice = couponSalePrice > coupon.maxSalePrice ? coupon.maxSalePrice : couponSalePrice
                //         }
                //     }
                // }
                totalCouponedPrice += optionedSaledPrice * orderItem.num - couponSalePrice
            }

            console.log(orderItemsCoupons)

            const totalSale = totalItemPrice - totalSaledPrice
            const totalCouponSale = totalSaledPrice - totalCouponedPrice
            const totalPaymentPriceWithoutPoint = totalCouponedPrice + totalDeliveryPrice + totalExtraDeliveryPrice
            const maxPointPrice = totalPaymentPriceWithoutPoint < user.point ? totalPaymentPriceWithoutPoint - MIN_PAYMENT_PRICE : user.point
            const totalPointSale = point > maxPointPrice ? maxPointPrice : point
            const totalPaymentPrice = totalPaymentPriceWithoutPoint - totalPointSale


            return {
                orderItems,
                user,
                orderItemsCoupons,
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