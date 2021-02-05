import { objectType } from "nexus"

export const Coupon = objectType({
    name: 'Coupon',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.image()
        t.model.name()
        t.model.period()
        t.model.minItemPrice()
        t.model.maxSalePrice()
        t.model.salePercent()
        t.model.salePrice()
        t.model.user()
        t.model.order()
        t.model.userId()
        t.model.orderId()
    }
})