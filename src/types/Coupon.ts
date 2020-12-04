import { objectType } from "@nexus/schema"

export const Coupon = objectType({
    name: 'Coupon',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
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