import { objectType } from "@nexus/schema"

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
        t.model.Coupon()
        t.model.ItemReview()
        t.model.Items()
        t.model.User()
        t.model.Payment()
        t.model.userId()
        t.model.paymentId()
    }
})