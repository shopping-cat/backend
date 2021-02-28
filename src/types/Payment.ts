import { objectType } from "nexus"

export const Payment = objectType({
    name: 'Payment',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.name()
        t.model.state()
        t.model.cancelReason()
        t.model.paymentMethod()
        t.model.price()
        t.model.deliveryPrice()
        t.model.extraDeliveryPrice()
        t.model.address()
        t.model.addressName()
        t.model.addressPhone()
        t.model.postCode()
        t.model.itemSale()
        t.model.couponSale()
        t.model.pointSale()
        t.model.totalPrice()
        t.model.deliveryMemo()
        t.model.userId()
        t.model.user()
        t.model.orders()
    }
})

export type PaymentState =
    '결제요청' | // 
    '구매접수' | // 30 분정도  텀을 둠 // 이때는 유저가 환불 할 수 있음
    '정상처리' | // 정상적으로 주문이 됨
    '취소처리' | // 모든 아이템이 구매접수 상태에서 유저가 전체 취소를 했을때
    '오류처리' // 