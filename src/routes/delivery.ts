import dayjs from 'dayjs'
import express from 'express'
import { prisma } from '../context'
import createNotification from '../utils/createNotification'

const router = express.Router()

// 스마트택배 배송 추적 api에서 callback으로 사용될 주소
// 주문 상태를 배송중 -> 배송완료 함
router.post('/trace', async (req, res, next) => {
    try {
        const { fid, invoice_no, level, time_trans } = req.body

        const prevOrder = await prisma.order.findUnique({ where: { id: Number(fid) } })

        if (!prevOrder) throw new Error('유효하지 않은 fid입니다')
        if (prevOrder?.deliveryNumber !== invoice_no) throw new Error('운송장번호가 다릅니다')
        // 배송완료일대만 처리
        if (Number(level) !== 6) return res.status(200).json({
            code: true,
            message: 'success'
        })

        const order = await prisma.order.update({
            where: { id: Number(fid) },
            data: {
                deliveryCompletionDate: dayjs(time_trans).toDate(),
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
                type: 'OrderDetail',
                params: { data: { id: order.paymentId } }
            },
            order.userId,
            false,
            true
        )

        return res.status(200).json({
            code: true,
            message: 'success'
        })
    } catch (error) {
        res.status(400).json({
            code: false,
            message: 'fail - ' + error
        })
    }
})


export default router