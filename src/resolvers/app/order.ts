import { Coupon } from "@prisma/client";
import { inputObjectType, intArg, list, nonNull, nullable, objectType, queryField, stringArg } from "nexus";
import getIUser from "../../utils/getIUser";
import salePrice from "../../utils/salePrice";


export const orderCalculateType = objectType({
    name: 'orderCalculateType',
    definition: (t) => {
        t.list.field('orderItems', { type: 'CartItem' }) // 주문 상품
        t.field('user', { type: 'User', }) // 배송지 정보 + 환불계좌 + 포인트 참조용
        t.list.list.field('itemsCoupons', { type: 'Coupon' }) // 아이템별 적용가능 쿠폰들
        t.int('totalItemPrice') // 총 상품 금액
        t.int('totalSaledPrice')  // 상품 세일 적용 총 금액
        t.int('totalCouponedPrice') // 쿠폰 적용 총 금액
        t.int('totalDeliveryPrice') // 배송비
        t.int('totalExtraDeliveryPrice') // 산간지역 추가 배송비 TODO
        t.int('totalSale') // 상품 할인
        t.int('totalCouponSale') // 쿠폰 할인
        t.int('totalPointSale') // 포인트 할인
        t.int('totalPaymentPrice') // 총 결제 금액
    }
})

// QUERY - 앱 주문/결제 페이지
export const orderCalculate = queryField('orderCaculate', {
    type: orderCalculateType,
    args: {
        cartItemIds: nonNull(list(intArg())),
        point: nonNull(intArg()),
        couponIds: nullable(list(nullable(stringArg())))
    },
    resolve: async (_, { cartItemIds, point, couponIds }, ctx) => {
        try {
            const user = await getIUser(ctx)
            const orderItems = await ctx.prisma.cartItem.findMany({
                where: { id: { in: cartItemIds } },
                include: { item: true }
            })

            const itemsCoupons: Coupon[][] = []


            let totalItemPrice = 0
            let totalSaledPrice = 0
            let totalCouponedPrice = 0
            let totalDeliveryPrice = 0
            let totalExtraDeliveryPrice = 0

            for (const i in orderItems) {
                const orderItem = orderItems[i]

                totalItemPrice += orderItem.item.price
                const saledPrice = salePrice(orderItem.item.sale, orderItem.item.price)
                totalSaledPrice += saledPrice
                totalDeliveryPrice += orderItem.item.deliveryPrice
                totalExtraDeliveryPrice += orderItem.item.extraDeliveryPrice

                // 쿠폰
                const couponId = couponIds[i]
                const coupon = await ctx.prisma.coupon.findUnique({ where: { id: couponId } })
                if (!coupon) continue
                if (coupon.period.getTime() > Date.now()) throw new Error(`기간이 지난 쿠폰 입니다 (${coupon.name})`)
                if (coupon.minItemPrice && coupon.minItemPrice > totalSaledPrice) throw new Error(`쿠폰 최소 금액보다 상품 가격이 낮습니다 (${coupon.name})`)
                let couponSalePrice = 0
                if (coupon.salePrice) couponSalePrice = couponSalePrice
                else if (coupon.salePercent) couponSalePrice = saledPrice - salePrice(coupon.salePercent, saledPrice)
                if (coupon.maxSalePrice) couponSalePrice = couponSalePrice > coupon.maxSalePrice ? coupon.maxSalePrice : couponSalePrice
                totalCouponedPrice += saledPrice - couponSalePrice
            }

            const totalSale = totalItemPrice - totalSaledPrice
            const totalCouponSale = totalSaledPrice - totalCouponedPrice
            const totalPaymentPriceWithoutPoint = totalCouponSale + totalDeliveryPrice + totalExtraDeliveryPrice
            const totalPointSale = totalPaymentPriceWithoutPoint < point ? totalPaymentPriceWithoutPoint : point // clamp
            const totalPaymentPrice = totalCouponedPrice - totalPointSale

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
                totalPaymentPrice
            }
        } catch (error) {
            throw error
        }
    }
})

// const orderRequest