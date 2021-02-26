import { Coupon } from "@prisma/client";
import { inputObjectType, intArg, list, nonNull, nullable, objectType, queryField, stringArg } from "nexus";
import { type } from "os";
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
            console.log(coupons)
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

export const orderDataToPGDataType = objectType({
    name: 'orderDataToPGDataType',
    definition: (t) => {
        t.nonNull.int('amount') // 결제 금액
        t.nonNull.string('name') // 결제 이름
        t.nonNull.string('uid') // 결제 uid
        t.nonNull.field('user', { type: 'User' }) // 결제 대상 유저
    }
})

export const orderDataToPGData = queryField(t => t.field('orderDataToPGData', {
    type: orderDataToPGDataType,
    args: {
        amount: nonNull(intArg()),
        cartItemIds: nonNull(list(intArg())),
        point: nonNull(intArg()),
        coupons: nonNull(list(OrderCouponArg))
    },
    resolve: async (_, { amount, cartItemIds, point, coupons }, ctx) => {

        const { id } = await getIUser(ctx)
        const user = await ctx.prisma.user.findUnique({
            where: { id },
            include: {
                deliveryInfo: true,
                refundBankAccount: true
            }
        })
        if (!user) throw new Error('권한이 없습니다')
        if (!user.deliveryInfo) throw new Error('배송지 정보를 입력해주세요')
        if (!user.refundBankAccount) throw new Error('환불계좌 정보를 입력해주세요')
        // TODO 본인인증
        const uid = `${new Date().getTime()}`
        const cartItems = await ctx.prisma.cartItem.findMany({
            where: { id: { in: cartItemIds }, userId: user.id },
            include: { item: true }
        })
        if (cartItems.length === 0) throw new Error('아이템이 존재하지 않습니다')
        const name = `${cartItems[0].item.name}${cartItems.length > 1 ? ` 외 ${cartItems.length - 1}가지 상품` : ''}`

        // 가격 확인
        let totalPrice = 0
        for (const i in cartItems) {
            const cartItem = cartItems[i]

            // 기본금에 세일 적용
            let itemPrice = salePrice(cartItem.item.sale, cartItem.item.price)
            // 옵션이 있다면 옵션 적용
            const itemOption = cartItem.item.option as ItemOption
            const cartItemOption = cartItem.option as CartItemOption
            if (itemOption && cartItemOption) {
                for (const i in itemOption.data) {
                    const optionPrice = itemOption.data[i].optionDetails[cartItemOption.data[i]].price
                    itemPrice += optionPrice
                }
            }
            // 쿠폰 적용
            let totalCouponedPrice = 0 // 수량 적용된 가격
            for (let i = 0; i < cartItem.num; i++) {
                let basicPrice = itemPrice
                const currentOrderItemCoupons = coupons.filter((v: any) => v.orderItemId === cartItem.id)
                if (currentOrderItemCoupons.length > i) {
                    const currentCouponId = currentOrderItemCoupons[i].couponId
                    const coupon = await ctx.prisma.coupon.findUnique({ where: { id: currentCouponId } })
                    if (!coupon) throw new Error('없는 쿠폰 입니다')
                    if (coupon.userId !== user.id) throw new Error('사용 불가능한 쿠폰입니다')
                    if (coupon.orderId) throw new Error('이미 사용된 쿠폰입니다')
                    if (coupon.period.getTime() < new Date().getTime()) throw new Error('사용기간이 지난 쿠폰입니다')
                    if (coupon.salePrice) {
                        basicPrice -= coupon.salePrice
                        if (basicPrice < 0) basicPrice = 0 // clamp
                    }
                    if (coupon.salePercent) {
                        basicPrice = salePrice(coupon.salePercent, basicPrice)
                        if (coupon.maxSalePrice && itemPrice - basicPrice > coupon.maxSalePrice) { // maxSalePrice 처리
                            basicPrice = itemPrice - coupon.maxSalePrice
                        }
                    }

                }
                totalCouponedPrice += basicPrice
            }
            // 배송비
            let deliveryPrice = cartItem.item.deliveryPrice
            if (false /* 산간지역이라면 */) {
                deliveryPrice += cartItem.item.extraDeliveryPrice
            }
            totalPrice += totalCouponedPrice + deliveryPrice
            console.log(totalCouponedPrice + deliveryPrice)
        }
        // 포인트 적용
        if (point < 0) throw new Error('포인트는 0보다 작을수 없습니다')
        totalPrice -= point

        if (totalPrice !== amount) throw new Error('계산 오류가 발생했습니다')
        if (totalPrice < MIN_PAYMENT_PRICE) throw new Error(`최소 결제 금액은 ${MIN_PAYMENT_PRICE}원 입니다`)

        return {
            amount,
            name,
            uid,
            user,
        }
    }
}))


// const orderRequest