import axios from "axios"
import { intArg, list, mutationField, nonNull, nullable, queryField, stringArg } from "nexus"
import { CartItemOption, ItemOption } from "../../types"
import addPoint from "../../utils/addPoint"
import asyncDelay from "../../utils/asyncDelay"
import bankNameToBankCode from "../../utils/bankNameToBankCode"
import getIUser from "../../utils/getIUser"
import salePrice from "../../utils/salePrice"
import { MIN_PAYMENT_PRICE } from "../../values"
import { OrderCouponArg } from "./order"


// Query - 주문 조회
export const payment = queryField(t => t.field('payment', {
    type: 'Payment',
    args: {
        id: nonNull(stringArg())
    },
    resolve: async (_, { id }, ctx) => {
        await asyncDelay()

        const user = await getIUser(ctx)

        const payment = await ctx.prisma.payment.findUnique({
            where: { id }
        })
        if (!payment) throw new Error('없는 주문 입니다')
        if (payment.userId !== user.id) throw new Error('접근 권한이 없는 계정입니다')

        return payment
    }
}))

// Query - 내 주문 내역들
export const payments = queryField(t => t.list.field('payments', {
    type: 'Payment',
    args: {
        offset: nullable(intArg({ default: 0 })),
        limit: nullable(intArg({ default: 10 }))
    },
    resolve: async (_, { offset, limit }, ctx) => {
        await asyncDelay()
        const user = await getIUser(ctx)
        const payments = await ctx.prisma.payment.findMany({
            skip: offset,
            take: limit,
            where: {
                userId: user.id,
                state: { notIn: ['결제요청', '결제취소'] }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return payments
    }
}))

// Mutation - PG요청 직전
export const createPayment = mutationField(t => t.field('createPayment', {
    type: 'Payment',
    args: {
        amount: nonNull(intArg()),
        cartItemIds: nonNull(list(intArg())),
        point: nonNull(intArg()),
        coupons: nonNull(list(OrderCouponArg)),
        method: nonNull(stringArg()),
        deliveryMemo: nonNull(stringArg())
    },
    resolve: async (_, { amount, cartItemIds, point, coupons, method, deliveryMemo }, ctx) => {
        try {
            await asyncDelay()
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
            const ordersTemp = []
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
                const optionStringList: string[] = []
                // 옵션이 있다면 옵션 적용
                const itemOption = cartItem.item.option as ItemOption
                const cartItemOption = cartItem.option as CartItemOption
                if (itemOption && cartItemOption) {
                    for (const i in itemOption.data) {
                        const option = itemOption.data[i].optionDetails[cartItemOption.data[i]]
                        optionStringList.push(option.name)
                        itemPrice += option.price
                        optionPrice += option.price
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
                // 영수증 계산
                const currentDeliveryPrice = cartItem.item.deliveryPrice
                const currentExtraDeliveryPrice = false ? cartItem.item.extraDeliveryPrice : 0 // TODO
                // 적용
                price += (cartItem.item.price + optionPrice) * cartItem.num
                deliveryPrice += currentDeliveryPrice
                extraDeliveryPrice += currentExtraDeliveryPrice
                itemSale += (cartItem.item.price - salePrice(cartItem.item.sale, cartItem.item.price)) * cartItem.num
                couponSale += (itemPrice * cartItem.num) - totalCouponedPrice
                totalPrice += totalCouponedPrice + currentDeliveryPrice + currentExtraDeliveryPrice
                // Order생성할때 사용할 데이터들
                ordersTemp.push({
                    itemId: cartItem.item.id,
                    itemPrice: cartItem.item.price,
                    itemSale: cartItem.item.sale,
                    itemOptionPrice: optionPrice,
                    cartItemId: cartItem.id,
                    num: cartItem.num,
                    option: optionStringList,
                    coupons: coupons.filter((v: any) => v.orderItemId === cartItem.id)
                })
            }
            // 포인트 적용
            if (point < 0) throw new Error('포인트는 0보다 작을수 없습니다')
            totalPrice -= point
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
                    deliveryMemo,
                    user: { connect: { id: user.id } },
                    orders: {
                        create: ordersTemp.map(v => ({
                            item: { connect: { id: v.itemId } },
                            user: { connect: { id: user.id } },
                            itemOptionPrice: v.itemOptionPrice,
                            itemPrice: v.itemPrice,
                            itemSale: v.itemSale,
                            num: v.num,
                            state: '구매접수',
                            itemOption: v.option.length > 0 ? { data: v.option } : undefined,
                            coupons: { connect: v.coupons.map((i: any) => ({ id: i.couponId })) },
                            cartItemId: v.cartItemId
                        }))
                    }
                }
            })

            return payment
        } catch (error) {
            console.error(error)
            throw error
        }
    }
}))


// Mutation - PG 요청 직후 오류 처리까지
export const completePayment = mutationField(t => t.field('completePayment', {
    type: 'Payment',
    args: {
        imp_uid: nonNull(stringArg()),
        merchant_uid: nonNull(stringArg())
    },
    resolve: async (_, { imp_uid, merchant_uid }, ctx) => {
        try {
            await asyncDelay()
            const user = await getIUser(ctx)

            // 결제 정보 조회
            const getToken = await axios.post(
                'https://api.iamport.kr/users/getToken',
                {
                    imp_key: process.env.IAMPORT_REST_API_KEY,
                    imp_secret: process.env.IAMPORT_REST_API_SECRET
                }
            )
            if (!getToken?.data?.response) throw new Error('결제정보 조회 실패')
            const { access_token } = getToken.data.response // 인증 토큰

            const getPaymentData = await axios.get(
                `https://api.iamport.kr/payments/${imp_uid}`,
                {
                    headers: { 'Authorization': access_token }
                }
            )
            if (!getPaymentData?.data?.response) throw new Error('결제정보 조회 실패')
            const paymentData = getPaymentData.data.response

            const prevPayment = await ctx.prisma.payment.findUnique({
                where: { id: merchant_uid },
                include: { orders: true }
            })
            if (!prevPayment) throw new Error('없는 주문 입니다')
            if (prevPayment.userId !== user.id) throw new Error('접근 권한이 없는 계정입니다')
            if (prevPayment.state !== '결제요청') throw new Error('잘못된 주문 절차입니다')
            if (prevPayment.totalPrice !== paymentData.amount) throw new Error('위조된 결제시도')
            // 오류 처리

            switch (paymentData.status) {
                case 'failed': // 오류
                    await ctx.prisma.payment.update({
                        where: { id: merchant_uid },
                        data: {
                            cancelReason: paymentData.fail_reason || '알 수 없는 이유',
                            state: '결제취소'
                        }
                    })
                    break
                case 'ready': // 가상계좌 발급
                    const { vbank_num, vbank_date, vbank_name } = paymentData
                    await ctx.prisma.payment.update({
                        where: { id: merchant_uid },
                        data: {
                            vBankDate: vbank_date,
                            vBankNum: vbank_num,
                            vBankName: vbank_name,
                            state: '입금대기'
                        }
                    })
                    break
                case 'paid': // 결제 성공
                    await ctx.prisma.payment.update({
                        where: { id: merchant_uid },
                        data: {
                            state: '구매접수'
                        }
                    })
                    break
            }

            if (paymentData.status !== 'failed') {
                //카트에서 삭제
                await ctx.prisma.cartItem.deleteMany({
                    where: {
                        userId: user.id,
                        id: { in: prevPayment.orders.map(v => v.cartItemId) }
                    }
                })
                // 포인트 삭제
                if (prevPayment.pointSale > 0) {
                    await addPoint(-prevPayment.pointSale, '상품구매', user.id, ctx)
                }
            }

            const payment = await ctx.prisma.payment.findUnique({
                where: { id: merchant_uid }
            })

            return payment
        } catch (error) {
            console.error(error)
            throw error
        }
    }
}))

export const cancelPayment = mutationField(t => t.field('cancelPayment', {
    type: 'Payment',
    args: {
        id: nonNull(stringArg())
    },
    resolve: async (_, { id }, ctx) => {
        await asyncDelay()
        const user = await getIUser(ctx)
        const refundBankAccount = await ctx.prisma.userRefundBankAccount.findUnique({
            where: { userId: user.id },
        })
        const payment = await ctx.prisma.payment.findUnique({
            where: { id },
            include: {
                orders: { include: { coupons: true } }
            }
        })
        if (!payment) throw new Error('존재하지 않는 주문 입니다')
        if (payment.userId !== user.id) throw new Error('접근 권한 없는 계정입니다')
        if (payment.state !== '구매접수' && payment.state !== '입금대기') throw new Error(`${payment.state} 상태에서는 취소하실 수 없습니다`)
        if (payment.paymentMethod === '가상계좌' && !refundBankAccount) throw new Error('환불계좌 등록이 필요합니다. 프로필에서 변경가능합니다')


        // 현금 환불 TODO 가상계좌 처리
        const getToken = await axios.post(
            'https://api.iamport.kr/users/getToken',
            {
                imp_key: process.env.IAMPORT_REST_API_KEY,
                imp_secret: process.env.IAMPORT_REST_API_SECRET
            }
        )
        if (!getToken?.data?.response) throw new Error('결제정보 조회 실패')
        const { access_token } = getToken.data.response // 인증 토큰
        const getCancelData = await axios.post(
            'https://api.iamport.kr/payments/cancel',
            {
                merchant_uid: payment.id,
                refund_holder: payment.paymentMethod === '가상계좌' ? refundBankAccount?.ownerName : undefined,
                refund_bank: payment.paymentMethod === '가상계좌' && refundBankAccount ? bankNameToBankCode(refundBankAccount.bankName) : undefined,
                refund_account: payment.paymentMethod === '가상계좌' ? refundBankAccount?.accountNumber : undefined
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": access_token
                }
            }
        )
        const { response } = getCancelData.data // 환불 결과
        if (!response) throw new Error(getCancelData.data.message || '환불 오류')

        // 쿠폰 해제
        for (const order of payment.orders) {
            if (order.coupons.length === 0) continue
            await ctx.prisma.order.update({
                where: { id: order.id },
                data: {
                    coupons: { disconnect: order.coupons.map(v => ({ id: v.id })) }
                }
            })
        }

        // 포인트 환불
        await addPoint(payment.pointSale, '주문 취소', user.id, ctx)

        // 상태 변경
        const newPayment = await ctx.prisma.payment.update({
            where: { id },
            data: {
                state: '취소처리',
                cancelReason: '없음' // 취소사유
            }
        })

        return newPayment
    }
}))