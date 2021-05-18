import dayjs from 'dayjs'
import express from 'express'
import { prisma } from '../context'
import addPoint from '../utils/addPoint'
import createNotification from '../utils/createNotification'
import { POINT_BACK_PERCENT } from '../values'

const router = express.Router()

// 1분마다 호출
// 구매접수 상태인 결제를 결제한지 30분이 지났다면 정상처리로 변경
router.post('/paymentStateUpdateToSuccess', async (req, res, next) => {
    try {
        const payments = await prisma.payment.findMany({
            where: {
                state: '구매접수',
                createdAt: { lt: dayjs().add(-30, 'minutes').toDate() },
            },
            orderBy: { createdAt: 'asc' },
            include: {
                orders: {
                    include: {
                        item: {
                            include: {
                                shop: {
                                    include: {
                                        seller: true,
                                        partner: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            take: 100 // 100개 단위로 처리
        })
        await prisma.payment.updateMany({
            where: { id: { in: payments.map(v => v.id) } },
            data: { state: '정상처리' }
        })

        // shop에다가 메시지 보내주기 TODO
        for (const payment of payments) {
            for (const order of payment.orders) {
                order.item.shop?.seller?.email
            }
        }
        res.send()
    } catch (error) {
        next(error)
    }
})

// 1분마다 호출
// 배송완료 상태에서 교환/환불 없이 7일이 지났다면 구매확정으로 변환
router.post('/orderStateUpdateToConfirmed', async (req, res, next) => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                state: '배송완료',
                deliveryCompletionDate: { lt: dayjs().add(-7, 'day').toDate() },
            },
            include: {
                payment: true,
                item: true
            },
            take: 100 // 100개 단위로 처리
        })

        for (const order of orders) {
            const point = Math.floor(order.payment.totalPrice * order.totalPrice / (order.payment.totalPrice + order.payment.pointSale) * POINT_BACK_PERCENT / 100)
            if (point > 0) {
                await addPoint(point, '구매확정 포인트 적립', order.userId)
                await createNotification(
                    {
                        user: { connect: { id: order.userId } },
                        title: '배송완료',
                        content: `${order.item.name} 상품의 구매 포인트가 적립되었습니다.`,
                        type: 'Point'
                    },
                    order.userId,
                    false,
                    true
                )
            }
            await prisma.order.update({
                where: { id: order.id },
                data: { state: '구매확정' }
            })
        }
        res.send()
    } catch (error) {
        next(error)
    }
})


export default router