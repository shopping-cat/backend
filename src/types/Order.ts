import { objectType } from "@nexus/schema"

export const Order = objectType({
    name: 'Order',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.Item()
        t.model.itemId()
        t.model.User()
        t.model.userId()
    }
})