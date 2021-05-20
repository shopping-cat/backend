import dayjs from 'dayjs'
import express from 'express'
import { prisma } from '../context'
import addPoint from '../utils/addPoint'
import createNotification from '../utils/createNotification'
import getDeliveryInfo from '../utils/getDeliveryInfo'
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
        return res.send()
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
        return res.send()
    } catch (error) {
        next(error)
    }
})

// 5분마다 호출
// 배송중 -> 배송완료
router.post('/orderStateUpdateToCompletedDelivery', async (req, res, next) => {
    try {
        const count = await prisma.order.count({ where: { state: '배송중' } })
        const ramdomSkip = Math.floor(Math.random() * count)
        const orders = await prisma.order.findMany({
            where: {
                state: '배송중'
            },
            include: {
                payment: true,
                item: true
            },
            take: 100,// 100개 단위로 처리
            skip: ramdomSkip - 100 > 0 ? ramdomSkip - 100 : 0
        })

        const list = await Promise.all(orders.map(v => {
            return (async () => {
                try {
                    if (!v.deliveryCompanyCode) throw new Error('택배사 코드 없음')
                    if (!v.deliveryNumber) throw new Error('운송장 번호 없음')

                    const data = await getDeliveryInfo(v.deliveryCompanyCode, v.deliveryNumber)
                    if (data.state.id !== 'delivered') return null

                    return v.id
                } catch (error) {
                    console.error('배송조회 오류 주문번호 : ' + v.id)
                    return null
                }
            })()
        }))

        await prisma.order.updateMany({
            where: {
                id: { in: list.filter(v => v !== null) as number[] }
            },
            data: {
                deliveryCompletionDate: new Date(),
                state: '배송완료'
            }
        })

        for (const orderIds of list.filter(v => v !== null) as number[]) {
            try {
                const order = orders.find(v => v.id === orderIds)
                if (!order) continue
                await createNotification(
                    {
                        user: { connect: { id: order.userId } },
                        title: '배송완료',
                        content: `${order.item.name} 상품이 배송완료 되었습니다.\n교환/환불은 7일 이내에 가능합니다.`,
                        type: 'OrderDetail',
                        params: { data: { id: order.paymentId } }
                    },
                    order.userId,
                    false,
                    true
                )
            } catch (error) { }
        }

        return res.status(200).send()
    } catch (error) {
        next(error)
    }
})


export default router