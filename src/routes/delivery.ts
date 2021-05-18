import dayjs from 'dayjs'
import express from 'express'
import { prisma } from '../context'
import createNotification from '../utils/createNotification'

const router = express.Router()

// 스마트택배 배송 추적 api에서 callback으로 사용될 주소
// 주문 상태를 배송중 -> 배송완료 함
router.post('/trace', async (req, res, next) => {
    try {
        const order = await prisma.order.update({
            where: { id: 123 },
            data: {
                deliveryCompletionDate: dayjs().toDate(),
                state: '배송완료'
            },
            include: {
                item: true
            }
        })

        await createNotification(
            {
                user: { connect: { id: order.userId } },
                title: '배송완료',
                content: `${order.item.name} 상품이 배송완료 되었습니다.\n교환/환불은 7일 이내에 가능합니다.`,
                type: 'Payment',
                params: { data: { id: order.paymentId } }
            },
            order.userId
        )
    } catch (error) {
        next(error)
    }
})


export default router