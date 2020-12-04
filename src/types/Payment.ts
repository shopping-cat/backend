import { objectType } from "@nexus/schema"

export const Payment = objectType({
    name: 'Payment',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.state()
        t.model.paymentMethod()
        t.model.cashReceipt()
        t.model.cashReceiptData()
        t.model.refundMethod()
        t.model.price()
        t.model.itemSale()
        t.model.couponSale()
        t.model.pointSale()
        t.model.totalPrice()
        t.model.Orders()
        t.model.User()
        t.model.userId()
    }
})