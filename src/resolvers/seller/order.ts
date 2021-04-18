import axios from "axios";
import { intArg, mutationField, nonNull, nullable, queryField, stringArg } from "nexus";
import addPoint from "../../utils/addPoint";
import bankNameToBankCode from "../../utils/bankNameToBankCode";
import errorFormat from "../../utils/errorFormat";
import getISeller from "../../utils/getISeller";

export const newOrders = queryField(t => t.list.field('newOrders', {
    type: 'Order',
    args: {
        limit: nullable(intArg({ default: 10 })),
        offset: nullable(intArg({ default: 0 }))
    },
    resolve: async (_, { limit, offset }, ctx) => {
        const seller = await getISeller(ctx)
        const orders = await ctx.prisma.order.findMany({
            where: {
                item: { shopId: seller.shopId },
                state: '구매접수',
                payment: { state: '정상처리' },
            },
            orderBy: {
                userId: 'asc' // 유저끼리 묶어서 보여주리고
            },
            skip: offset,
            take: limit
        })
        return orders
    }
}))

export const onDeliveryOrders = queryField(t => t.list.field('onDeliveryOrders', {
    type: 'Order',
    args: {
        limit: nullable(intArg({ default: 10 })),
        offset: nullable(intArg({ default: 0 }))
    },
    resolve: async (_, { limit, offset }, ctx) => {
        const seller = await getISeller(ctx)
        const orders = await ctx.prisma.order.findMany({
            where: {
                item: { shopId: seller.shopId },
                state: '배송중',
                payment: { state: '정상처리' },
            },
            orderBy: {
                updatedAt: 'desc'
            },
            skip: offset,
            take: limit
        })
        return orders
    }
}))

export const completedDeliveryOrders = queryField(t => t.list.field('completedDeliveryOrders', {
    type: 'Order',
    args: {
        limit: nullable(intArg({ default: 10 })),
        offset: nullable(intArg({ default: 0 }))
    },
    resolve: async (_, { limit, offset }, ctx) => {
        const seller = await getISeller(ctx)
        const orders = await ctx.prisma.order.findMany({
            where: {
                item: { shopId: seller.shopId },
                state: '배송완료',
                payment: { state: '정상처리' },
            },
            orderBy: {
                updatedAt: 'desc'
            },
            skip: offset,
            take: limit
        })
        return orders
    }
}))

export const confirmedOrders = queryField(t => t.list.field('confirmedOrders', {
    type: 'Order',
    args: {
        limit: nullable(intArg({ default: 10 })),
        offset: nullable(intArg({ default: 0 }))
    },
    resolve: async (_, { limit, offset }, ctx) => {
        const seller = await getISeller(ctx)
        const orders = await ctx.prisma.order.findMany({
            where: {
                item: { shopId: seller.shopId },
                state: '구매확정',
                payment: { state: '정상처리' },
            },
            orderBy: {
                updatedAt: 'desc'
            },
            skip: offset,
            take: limit
        })
        return orders
    }
}))

export const refundRequestOrders = queryField(t => t.list.field('refundRequestOrders', {
    type: 'Order',
    args: {
        limit: nullable(intArg({ default: 10 })),
        offset: nullable(intArg({ default: 0 }))
    },
    resolve: async (_, { limit, offset }, ctx) => {
        const seller = await getISeller(ctx)
        const orders = await ctx.prisma.order.findMany({
            where: {
                item: { shopId: seller.shopId },
                state: '환불중',
                payment: { state: '정상처리' },
            },
            orderBy: {
                updatedAt: 'desc'
            },
            skip: offset,
            take: limit
        })
        return orders
    }
}))


export const exchangeRequestOrders = queryField(t => t.list.field('exchangeRequestOrders', {
    type: 'Order',
    args: {
        limit: nullable(intArg({ default: 10 })),
        offset: nullable(intArg({ default: 0 }))
    },
    resolve: async (_, { limit, offset }, ctx) => {
        const seller = await getISeller(ctx)
        const orders = await ctx.prisma.order.findMany({
            where: {
                item: { shopId: seller.shopId },
                state: '교환중',
                payment: { state: '정상처리' },
            },
            orderBy: {
                updatedAt: 'desc'
            },
            skip: offset,
            take: limit
        })
        return orders
    }
}))

export const refundedOrders = queryField(t => t.list.field('refundedOrders', {
    type: 'Order',
    args: {
        limit: nullable(intArg({ default: 10 })),
        offset: nullable(intArg({ default: 0 }))
    },
    resolve: async (_, { limit, offset }, ctx) => {
        const seller = await getISeller(ctx)
        const orders = await ctx.prisma.order.findMany({
            where: {
                item: { shopId: seller.shopId },
                state: '환불처리',
                payment: { state: '정상처리' },
            },
            orderBy: {
                updatedAt: 'desc'
            },
            skip: offset,
            take: limit
        })
        return orders
    }
}))

export const exchangedOrders = queryField(t => t.list.field('exchangedOrders', {
    type: 'Order',
    args: {
        limit: nullable(intArg({ default: 10 })),
        offset: nullable(intArg({ default: 0 }))
    },
    resolve: async (_, { limit, offset }, ctx) => {
        const seller = await getISeller(ctx)
        const orders = await ctx.prisma.order.findMany({
            where: {
                item: { shopId: seller.shopId },
                state: '교환처리',
                payment: { state: '정상처리' },
            },
            orderBy: {
                updatedAt: 'desc'
            },
            skip: offset,
            take: limit
        })
        return orders
    }
}))


// 구매접수  -> 배송중
export const registDelivery = mutationField(t => t.field('registDelivery', {
    type: 'Order',
    args: {
        id: nonNull(intArg()),
        deliveryNumber: nonNull(stringArg()),
        deliveryCompany: nonNull(stringArg())
    },
    resolve: async (_, { id, deliveryNumber, deliveryCompany }, ctx) => {
        const seller = await getISeller(ctx)
        const prevOrder = await ctx.prisma.order.findUnique({
            where: { id },
            include: {
                item: true
            }
        })
        if (!prevOrder) throw errorFormat('존재하지 않는 주문입니다')
        if (prevOrder.item.shopId !== seller.shopId) throw errorFormat('권한이 없습니다')
        if (prevOrder.state !== '구매접수') throw errorFormat(`${prevOrder.state} 상태에서는 송장 등록이 불가능합니다`)
        const order = await ctx.prisma.order.update({
            where: { id },
            data: {
                deliveryCompany,
                deliveryNumber,
                state: '배송중'
            }
        })
        return order
    }
}))

// 주문 취소 금액환불
export const cancelOrder = mutationField(t => t.field('cancelOrder', {
    type: 'Order',
    args: {
        id: nonNull(intArg()),
        reason: nonNull(stringArg())
    },
    resolve: async (_, { id, reason }, ctx) => {
        const seller = await getISeller(ctx)
        const prevOrder = await ctx.prisma.order.findUnique({
            where: { id },
            include: {
                item: true,
                coupons: true,
                payment: {
                    include: {
                        orders: true
                    }
                },
                user: {
                    include: {
                        refundBankAccount: true
                    }
                }
            }
        })
        if (!prevOrder) throw errorFormat('존재하지 않는 주문입니다')
        if (prevOrder.item.shopId !== seller.shopId) throw errorFormat('권한이 없습니다')
        if (prevOrder.state !== '구매접수') throw errorFormat(`${prevOrder.state} 상태에서는 송장 등록이 불가능합니다`)

        // 현금을 할 수 있는만큼 먼저 취소처리하고 나머지는 포인트 환불로처리
        const cancelAblePrice = prevOrder.payment.totalPrice - prevOrder.payment.cancelPrice
        const cancelAblePoint = prevOrder.payment.pointSale - prevOrder.payment.cancelPoint
        const cancelPrice = cancelAblePrice >= prevOrder.totalPrice ? prevOrder.totalPrice : cancelAblePrice
        const cancelPoint = cancelAblePrice >= prevOrder.totalPrice ? 0 : prevOrder.totalPrice - cancelAblePrice
        if (cancelPoint > cancelAblePoint) throw errorFormat('포인트 환불 오류')
        // 부분환불
        if (cancelPrice > 0) {
            const getToken = await axios.post(
                'https://api.iamport.kr/users/getToken',
                {
                    imp_key: process.env.IAMPORT_REST_API_KEY,
                    imp_secret: process.env.IAMPORT_REST_API_SECRET
                }
            )
            if (!getToken?.data?.response) throw errorFormat('결제정보 조회 실패')
            const { access_token } = getToken.data.response // 인증 토큰

            const getCancelData = await axios.post(
                'https://api.iamport.kr/payments/cancel',
                {
                    merchant_uid: prevOrder.payment.id,
                    checksum: cancelAblePrice,
                    amount: cancelPrice,
                    reason,
                    refund_holder: prevOrder.payment.paymentMethod === '가상계좌' ? prevOrder.user.refundBankAccount?.ownerName : undefined,
                    refund_bank: prevOrder.payment.paymentMethod === '가상계좌' && prevOrder.user.refundBankAccount ? bankNameToBankCode(prevOrder.user.refundBankAccount.bankName) : undefined,
                    refund_account: prevOrder.payment.paymentMethod === '가상계좌' ? prevOrder.user.refundBankAccount?.accountNumber : undefined
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": access_token
                    }
                }
            )
            const { response } = getCancelData.data // 환불 결과
            if (!response) throw errorFormat(getCancelData.data.message || '환불 오류')
        }

        // 포인트 환불
        if (cancelPoint > 0) {
            await addPoint(cancelPoint, '부분 환불', prevOrder.user.id)
        }

        // DB에 저장
        await ctx.prisma.payment.update({
            where: { id: prevOrder.paymentId },
            data: {
                cancelPrice: { increment: cancelPrice },
                cancelPoint: { increment: cancelPoint }
            }
        })

        // 쿠폰 환불
        for (const coupon of prevOrder.coupons) {
            try {
                await ctx.prisma.coupon.update({
                    where: { id: coupon.id },
                    data: {
                        order: { disconnect: true }
                    }
                })
            } catch (error) {

            }
        }

        const order = await ctx.prisma.order.update({
            where: { id },
            data: {
                reason,
                state: '상점취소처리',
                refundMethod: '결제취소',
                refundPoint: cancelPoint,
                refundPrice: cancelPrice
            }
        })
        return order
    }
}))


export const refundOrder = mutationField(t => t.field('refundOrder', {
    type: 'Order',
    args: {
        id: nonNull(intArg())
    },
    resolve: async (_, { id }, ctx) => {
        const seller = await getISeller(ctx)
        const prevOrder = await ctx.prisma.order.findUnique({
            where: { id },
            include: {
                item: true,
                coupons: true,
                payment: {
                    include: {
                        orders: true
                    }
                },
                user: {
                    include: {
                        refundBankAccount: true
                    }
                }
            }
        })
        if (!prevOrder) throw errorFormat('존재하지 않는 주문입니다')
        if (prevOrder.item.shopId !== seller.shopId) throw errorFormat('권한이 없습니다')
        if (prevOrder.state !== '환불중') throw errorFormat(`${prevOrder.state} 상태에서는 환불이 불가능합니다`)

        // 현금을 할 수 있는만큼 먼저 취소처리하고 나머지는 포인트 환불로처리
        const cancelAblePrice = prevOrder.payment.totalPrice - prevOrder.payment.cancelPrice
        const cancelAblePoint = prevOrder.payment.pointSale - prevOrder.payment.cancelPoint
        const cancelPrice = cancelAblePrice >= prevOrder.totalPrice ? prevOrder.totalPrice : cancelAblePrice
        const cancelPoint = cancelAblePrice >= prevOrder.totalPrice ? 0 : prevOrder.totalPrice - cancelAblePrice
        if (cancelPoint > cancelAblePoint) throw errorFormat('포인트 환불 오류')
        // 부분환불
        if (cancelPrice > 0) {
            const getToken = await axios.post(
                'https://api.iamport.kr/users/getToken',
                {
                    imp_key: process.env.IAMPORT_REST_API_KEY,
                    imp_secret: process.env.IAMPORT_REST_API_SECRET
                }
            )
            if (!getToken?.data?.response) throw errorFormat('결제정보 조회 실패')
            const { access_token } = getToken.data.response // 인증 토큰

            const getCancelData = await axios.post(
                'https://api.iamport.kr/payments/cancel',
                {
                    merchant_uid: prevOrder.payment.id,
                    checksum: cancelAblePrice,
                    amount: cancelPrice,
                    refund_holder: prevOrder.payment.paymentMethod === '가상계좌' ? prevOrder.user.refundBankAccount?.ownerName : undefined,
                    refund_bank: prevOrder.payment.paymentMethod === '가상계좌' && prevOrder.user.refundBankAccount ? bankNameToBankCode(prevOrder.user.refundBankAccount.bankName) : undefined,
                    refund_account: prevOrder.payment.paymentMethod === '가상계좌' ? prevOrder.user.refundBankAccount?.accountNumber : undefined
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": access_token
                    }
                }
            )
            const { response } = getCancelData.data // 환불 결과
            if (!response) throw errorFormat(getCancelData.data.message || '환불 오류')
        }

        // 포인트 환불
        if (cancelPoint > 0) {
            await addPoint(cancelPoint, '부분 환불', prevOrder.user.id)
        }

        // DB에 저장
        await ctx.prisma.payment.update({
            where: { id: prevOrder.paymentId },
            data: {
                cancelPrice: { increment: cancelPrice },
                cancelPoint: { increment: cancelPoint }
            }
        })

        // 쿠폰 환불
        for (const coupon of prevOrder.coupons) {
            try {
                await ctx.prisma.coupon.update({
                    where: { id: coupon.id },
                    data: {
                        order: { disconnect: true }
                    }
                })
            } catch (error) {

            }
        }

        const order = await ctx.prisma.order.update({
            where: { id },
            data: {
                state: '환불처리',
                refundMethod: '결제취소',
                refundPoint: cancelPoint,
                refundPrice: cancelPrice
            }
        })
        return order
    }
}))

export const exchangeOrder = mutationField('exchangeOrder', {
    type: 'Order',
    args: {
        id: nonNull(intArg())
    },
    resolve: async (_, { id }, ctx) => {
        // TODO push message
        const order = ctx.prisma.order.update({
            where: { id },
            data: {
                state: '교환처리'
            }
        })
        return order
    }
})