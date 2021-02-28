import { intArg, list, mutationField, nonNull, queryField, stringArg } from "nexus"
import { consoleWarn } from "nexus/dist/core"
import { CartItemOption, ItemOption } from "../../types"
import getIUser from "../../utils/getIUser"
import salePrice from "../../utils/salePrice"
import { MIN_PAYMENT_PRICE } from "../../values"
import { item } from "./item"
import { OrderCouponArg } from "./order"

// Mutation - PG요청 직전
export const createPayment = mutationField(t => t.field('createPayment', {
    type: 'Payment',
    args: {
        amount: nonNull(intArg()),
        cartItemIds: nonNull(list(intArg())),
        point: nonNull(intArg()),
        coupons: nonNull(list(OrderCouponArg)),
        method: nonNull(stringArg())
    },
    resolve: async (_, { amount, cartItemIds, point, coupons, method }, ctx) => {
        try {
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
            let price = 0
            let deliveryPrice = 0
            let extraDeliveryPrice = 0
            let itemSale = 0
            let couponSale = 0
            let pointSale = point
            let totalPrice = 0
            for (const i in cartItems) {
                const cartItem = cartItems[i]

                // 기본금에 세일 적용
                let itemPrice = salePrice(cartItem.item.sale, cartItem.item.price)
                let optionPrice = 0
                // 옵션이 있다면 옵션 적용
                const itemOption = cartItem.item.option as ItemOption
                const cartItemOption = cartItem.option as CartItemOption
                if (itemOption && cartItemOption) {
                    for (const i in itemOption.data) {
                        const option = itemOption.data[i].optionDetails[cartItemOption.data[i]].price
                        itemPrice += option
                        optionPrice += option
                    }
                }
                console.log(optionPrice)
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
                // 영수증 계산
                const currentDeliveryPrice = cartItem.item.deliveryPrice
                const currentExtraDeliveryPrice = false ? cartItem.item.extraDeliveryPrice : 0 // TODO

                price += (cartItem.item.price + optionPrice) * cartItem.num
                deliveryPrice += currentDeliveryPrice
                extraDeliveryPrice += currentExtraDeliveryPrice
                itemSale += (cartItem.item.price - salePrice(cartItem.item.sale, cartItem.item.price)) * cartItem.num
                couponSale += (itemPrice * cartItem.num) - totalCouponedPrice
                totalPrice += totalCouponedPrice + currentDeliveryPrice + currentExtraDeliveryPrice
            }
            // 포인트 적용
            if (point < 0) throw new Error('포인트는 0보다 작을수 없습니다')
            totalPrice -= point
            console.log(price)
            console.log(itemSale)
            console.log(totalPrice)
            if (price + deliveryPrice + extraDeliveryPrice - itemSale - couponSale - pointSale !== totalPrice) throw new Error('계산 오류가 발생했습니다')
            if (totalPrice !== amount) throw new Error('계산 오류가 발생했습니다')
            if (totalPrice < MIN_PAYMENT_PRICE) throw new Error(`최소 결제 금액은 ${MIN_PAYMENT_PRICE}원 입니다`)

            const payment = await ctx.prisma.payment.create({
                data: {
                    id: uid,
                    state: '결제요청',
                    name,
                    paymentMethod: method,
                    price,
                    deliveryPrice,
                    extraDeliveryPrice,
                    itemSale,
                    couponSale,
                    pointSale,
                    totalPrice,
                    address: user.deliveryInfo.address + ' ' + user.deliveryInfo.addressDetail,
                    addressName: user.deliveryInfo.name,
                    addressPhone: user.deliveryInfo.phone,
                    postCode: user.deliveryInfo.postCode,
                    deliveryMemo: "", // TODO
                    user: { connect: { id: user.id } }
                }
            })

            console.log(payment)

            return payment
        } catch (error) {
            console.error(error)
            throw error
        }
    }
}))
