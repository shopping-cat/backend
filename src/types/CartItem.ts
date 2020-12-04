import { objectType } from "@nexus/schema"

export const CartItem = objectType({
    name: 'CartItem',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.option()
        t.model.user()
        t.model.item()
        t.model.userId()
        t.model.itemId()
    }
})