import { objectType } from "nexus"
import errorFormat from "../utils/errorFormat"
import salePrice from "../utils/salePrice"

export const Order = objectType({
    name: 'Order',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.state()
        t.model.itemPrice()
        t.model.itemOptionPrice()
        t.model.itemSale()
        t.model.totalPrice()
        t.model.num()
        t.model.itemOption()
        t.model.deliveryCompletionDate()
        t.model.deliveryNumber()
        t.model.deliveryCompany()
        t.model.reason()
        t.model.reasonDetail()
        t.model.refundPrice()
        t.model.refundPoint()
        t.model.refundMethod()
        t.model.userId()
        t.model.itemId()
        t.model.paymentId()
        t.model.cartItemId()
        t.model.coupons()
        t.model.itemReview()
        t.model.item()
        t.model.user()
        t.model.payment()
        t.model.profitReceiptId()
        t.model.profitReceipt()
        t.nullable.field('stringOptionNum', {
            type: 'String',
            async resolve({ itemOption: itemOptionJson, num }) {
                const itemOption = itemOptionJson as OrderItemOption
                if (!itemOption) return null
                return [...itemOption.data, `${num}개`].map((v, i) => `${i !== 0 ? ' | ' : ''}${v}`).join('')
            }
        })
        t.field('totalItemPrice', { // 쿠폰 세일 제외하고 기본가격 + 옵션가만
            type: 'Int',
            resolve: ({ num, itemPrice, itemSale, itemOptionPrice }) => {
                return (itemPrice + itemOptionPrice) * num
            }
        })
        t.field('expectationRefundPrice', {
            type: 'Int',
            async resolve({ paymentId, totalPrice }, { }, ctx) {
                const payment = await ctx.prisma.payment.findUnique({ where: { id: paymentId } })
                if (!payment) throw new Error
                const refundAblePrice = payment.totalPrice - payment.cancelPrice
                const refundPrice = refundAblePrice >= totalPrice ? totalPrice : refundAblePrice
                return refundPrice
            }
        })
        t.field('expectationRefundPoint', {
            type: 'Int',
            async resolve({ paymentId, totalPrice }, { }, ctx) {
                const payment = await ctx.prisma.payment.findUnique({ where: { id: paymentId } })
                if (!payment) throw new Error
                const refundAblePrice = payment.totalPrice - payment.cancelPrice
                const refundPoint = refundAblePrice >= totalPrice ? 0 : totalPrice - refundAblePrice
                return refundPoint
            }
        })
        t.field('expectationRefundMethod', {
            type: 'String',
            async resolve({ paymentId }, { }, ctx) {
                const payment = await ctx.prisma.payment.findUnique({ where: { id: paymentId } })
                if (!payment) return '오류'
                else return '결제취소' // default value
            }
        })
    }
})

export type OrderState = // 각각 아이템에 해당됨
    '구매접수' | // 접수
    '취소처리' | // 유저가 구매접수 단계에서 전체 취소 or 오류로 인한 전체 취소
    '상점취소처리' | // 재고 부족 등의 이유로 상점에서 취소하는 경우
    '배송중' | '배송완료' | '구매확정' | // 정상 
    '환불중' | '환불처리' | // 환불 
    '교환중' | '교환처리' // 교환

export type OrderItemOption = {
    data: string[]
} | null