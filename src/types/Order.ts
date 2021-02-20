import { objectType } from "nexus"

export const Order = objectType({
    name: 'Order',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.deliveryCompletionDate()
        t.model.num()
        t.model.address()
        t.model.phone()
        t.model.state()
        t.model.reason()
        t.model.deliveryMessage()
        t.model.itemOption()
        t.model.pointSale()
        t.model.coupon()
        t.model.itemReview()
        t.model.item()
        t.model.user()
        t.model.payment()
        t.model.itemId()
        t.model.userId()
        t.model.paymentId()
        t.nullable.field('stringOptionNum', {
            type: 'String',
            async resolve({ itemOption: itemOptionJson, num }) {
                const itemOption = itemOptionJson as OrderItemOption
                if (!itemOption) return null
                return [...itemOption.data, `${num}개`].map((v, i) => `${i !== 0 ? ' | ' : ''}${v}`).join('')
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