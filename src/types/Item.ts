import { objectType } from "@nexus/schema"

export const Item = objectType({
    name: 'Item',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.name()
        t.model.price()
        // t.model.Orders() // iOrders insted
        t.field('isNew', {
            type: 'Boolean',
            resolve: ({ createdAt }) => Date.now() - createdAt > 1000
        })
    }
})