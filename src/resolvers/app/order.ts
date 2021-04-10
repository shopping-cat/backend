import { Coupon } from "@prisma/client";
import { inputObjectType, intArg, list, mutationField, nonNull, nullable, objectType, queryField, stringArg } from "nexus";
import { type } from "os";
import { CartItemOption, ItemOption } from "../../types";

import errorFormat from "../../utils/errorFormat";
import getIUser from "../../utils/getIUser";
import salePrice from "../../utils/salePrice";
import { MIN_PAYMENT_PRICE } from "../../values";

export const order = queryField('order', {
    type: 'Order',
    args: {
        id: intArg()
    },
    resolve: async (_, { id }, ctx) => {

        return ctx.prisma.order.findUnique({
            where: { id }
        })
    }
})


export const OrderItemsCoupons = objectType({
    name: 'OrderItemsCoupons',
    definition: (t) => {
        t.nonNull.int('orderItemId')
        t.nonNull.list.field('coupons', { type: 'Coupon' })
    }
})

export const OrderCouponArg = inputObjectType({
    name: 'OrderCouponArg',
    definition: (t) => {
        t.nonNull.int('orderItemId')
        t.nonNull.string('couponId')
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
        coupons: nonNull(list(OrderCouponArg)),
        point: nonNull(intArg()),
    },
    resolve: async (_, { cartItemIds, point, coupons }, ctx) => {
        try {

            const user = await getIUser(ctx)
            const orderItems = await ctx.prisma.cartItem.findMany({
                where: { id: { in: cartItemIds } },
                include: { item: true }
            })
            // 결제안된 쿠폰 해제
            const prevCoupons = await ctx.prisma.coupon.findMany({
                where: {
                    userId: user.id,
                    period: { gt: new Date() },
                    order: { payment: { state: { in: ['결제요청', '결제취소', '취소처리', '오류처리'] } } }
                },
                include: {
                    order: { include: { coupons: true } },
                }
            })
            for (const { order } of prevCoupons) {
                if (!order) continue
                if (order.coupons.length === 0) continue
                try {
                    await ctx.prisma.order.update({
                        where: { id: order.id },
                        data: {
                            coupons: { disconnect: order.coupons.map(v => ({ id: v.id })) }
                        }
                    })
                } catch (error) {
                    console.error(error)
                }
            }


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
                if (false /* 산간지역이라면 */) {
                    totalExtraDeliveryPrice += orderItem.item.extraDeliveryPrice
                }
                // 쿠폰 적용 가격
                for (let i = 0; i < orderItem.num; i++) {
                    let basicPrice = optionedSaledPrice
                    const currentOrderItemCoupons = coupons.filter((v: any) => v.orderItemId === orderItem.id)
                    if (currentOrderItemCoupons.length > i) {
                        const currentCouponId = currentOrderItemCoupons[i].couponId
                        const coupon = await ctx.prisma.coupon.findUnique({ where: { id: currentCouponId } })
                        if (coupon) {
                            if (coupon.salePrice) {
                                basicPrice -= coupon.salePrice
                                if (basicPrice < 0) basicPrice = 0 // clamp
                            }
                            if (coupon.salePercent) {
                                basicPrice = salePrice(coupon.salePercent, basicPrice)
                                if (coupon.maxSalePrice && optionedSaledPrice - basicPrice > coupon.maxSalePrice) { // maxSalePrice 처리
                                    basicPrice = optionedSaledPrice - coupon.maxSalePrice
                                }
                            }
                        }
                    }
                    totalCouponedPrice += basicPrice
                }

                // 적용가능 쿠폰 리스트 
                const coupon = await ctx.prisma.coupon.findMany({
                    where: {
                        userId: user.id,
                        period: { gt: new Date() },
                        orderId: null,
                        OR: [{ minItemPrice: null }, { minItemPrice: { lte: optionedSaledPrice } }],
                    },
                    orderBy: {
                        period: 'asc'
                    }
                })
                orderItemsCoupons.push({
                    coupons: coupon,
                    orderItemId: orderItem.id
                })
            }

            const totalSale = totalItemPrice - totalSaledPrice
            const totalCouponSale = totalSaledPrice - totalCouponedPrice
            const totalPaymentPriceWithoutPoint = totalCouponedPrice + totalDeliveryPrice + totalExtraDeliveryPrice
            const maxPointPrice = totalPaymentPriceWithoutPoint < user.point ? totalPaymentPriceWithoutPoint - MIN_PAYMENT_PRICE < 0 ? 0 : totalPaymentPriceWithoutPoint - MIN_PAYMENT_PRICE : user.point
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


export const refundOrder = mutationField('refundOrder', {
    type: 'Order',
    args: {
        input: nonNull(inputObjectType({
            name: 'RefundOrderInput',
            definition: (t) => {
                t.nonNull.int('id')
                t.nonNull.string('reason')
                t.nonNull.string('reasonDetail')
            }
        }))
    },
    resolve: async (_, { input }, ctx) => {
        const { id, reason, reasonDetail } = input

        const prevOrder = await ctx.prisma.order.findUnique({ where: { id } })
        if (!prevOrder) throw errorFormat('존재하지 않는 주문 입니다')
        if (prevOrder.state !== '배송완료') throw errorFormat(`${prevOrder.state}상태에서는 환불이 불가능합니다.`)

        const order = await ctx.prisma.order.update({
            where: { id },
            data: {
                reason,
                reasonDetail,
                state: '환불중'
            }
        })
        return order
    }
})

export const exchangeOrder = mutationField('exchangeOrder', {
    type: 'Order',
    args: {
        input: nonNull(inputObjectType({
            name: 'ExchangeOrderInput',
            definition: (t) => {
                t.nonNull.int('id')
                t.nonNull.string('reason')
                t.nonNull.string('reasonDetail')
            }
        }))
    },
    resolve: async (_, { input }, ctx) => {
        const { id, reason, reasonDetail } = input

        const prevOrder = await ctx.prisma.order.findUnique({ where: { id } })
        if (!prevOrder) throw errorFormat('존재하지 않는 주문 입니다')
        if (prevOrder.state !== '배송완료') throw errorFormat(`${prevOrder.state}상태에서는 환불이 불가능합니다.`)

        const order = await ctx.prisma.order.update({
            where: { id },
            data: {
                reason,
                reasonDetail,
                state: '교환중'
            }
        })
        return order
    }
})