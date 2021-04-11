import dayjs from 'dayjs'
import express from 'express'
import { prisma } from '../context'

const router = express.Router()

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
            data: { state: '구매접수' }
        })

        // shop에다가 메시지 보내주기
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

export default router