import { objectType } from "nexus"

export const Order = objectType({
    name: 'Order',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
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
    }
})