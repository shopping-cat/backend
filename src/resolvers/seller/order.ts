import axios from "axios";
import FormData from "form-data";
import { intArg, mutationField, nonNull, nullable, queryField, stringArg } from "nexus";
import { URLSearchParams } from "url";
import addPoint from "../../utils/addPoint";
import bankNameToBankCode from "../../utils/bankNameToBankCode";
import createNotification from "../../utils/createNotification";
import deliveryCompanyCodeToDeliveryCompany from "../../utils/deliveryCompanyCodeToDeliveryCompany";
import errorFormat from "../../utils/errorFormat";
import getDeliveryCompanyList from "../../utils/getDeliveryCompanyList";
import getDeliveryInfo from "../../utils/getDeliveryInfo";
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
        deliveryCompanyCode: nonNull(stringArg()),
    },
    resolve: async (_, { id, deliveryNumber, deliveryCompanyCode }, ctx) => {
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

        // 배송추적 API 등록
        // const params = new URLSearchParams()
        // params.append('num', deliveryNumber)
        // params.append('code', deliveryCompanyCode)
        // params.append('fid', id)
        // params.append('callback_url', 'https://api.shoppingcat.kr/delivery/trace')
        // params.append('callback_type', 'json')
        // params.append('key', process.env.SWEETTRACKER_API_KEY || '')
        // params.append('tier', process.env.SWEETTRACKER_API_KEY || '')
        // params.append('type', 'json')

        // try {
        //     const { data } = await axios.post(
        //         'http://trace-api-dev.sweettracker.net:8102/add_invoice',
        //         params,
        //         {
        //             headers: {
        //                 "Content-Type": "application/x-www-form-urlencoded"
        //             }
        //         }
        //     )
        //     if (!data.success) throw new Error(data.e_message || '운송장 정보가 잘못되었습니다')
        // } catch (error) {
        //     console.log(error)
        //     throw errorFormat(error)
        // }


        // 배송정보 유효 확인
        const data = await getDeliveryInfo(deliveryCompanyCode, deliveryNumber)

        // 구매접수 -> 배송중 && 배송정보 등록
        const order = await ctx.prisma.order.update({
            where: { id },
            data: {
                deliveryCompany: data.carrier.name,
                deliveryCompanyCode,
                deliveryNumber,
                state: '배송중'
            },
            include: {
                item: true
            }
        })

        await createNotification(
            {
                user: { connect: { id: order.userId } },
                title: '배송시작',
                content: `${order.item.name} 상품의 배송이 시작되었습니다.`,
                type: 'OrderDetail',
                params: { data: { id: order.paymentId } }
            },
            order.userId
        )

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
            },
            include: {
                item: true
            }
        })

        await createNotification(
            {
                user: { connect: { id: order.userId } },
                title: '상점취소처리',
                content: `${order.item.name} 상품이 상점취소처리 되었습니다. \n사유 : ${order.reason}`,
                type: 'OrderDetail',
                params: { data: { id: order.paymentId } }
            },
            order.userId
        )

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
            },
            include: {
                item: true
            }
        })
        await createNotification(
            {
                user: { connect: { id: order.userId } },
                title: '환불처리',
                content: `${order.item.name} 상품이 정상적으로 환불처리 되었습니다. 환불금액은 지급은 최대 영업일로 3일 까지 소요 될 수 있으며 미지급시 문의 바랍니다.`,
                type: 'OrderDetail',
                params: { data: { id: order.paymentId } }
            },
            order.userId
        )
        return order
    }
}))

export const exchangeOrder = mutationField('exchangeOrder', {
    type: 'Order',
    args: {
        id: nonNull(intArg())
    },
    resolve: async (_, { id }, ctx) => {

        const order = await ctx.prisma.order.update({
            where: { id },
            data: {
                state: '교환처리'
            },
            include: {
                item: true
            }
        })
        await createNotification(
            {
                user: { connect: { id: order.userId } },
                title: '교환처리',
                content: `${order.item.name} 상품이 정상적으로 교환처리 되었습니다`,
                type: 'OrderDetail',
                params: { data: { id: order.paymentId } }
            },
            order.userId
        )
        return order
    }
})