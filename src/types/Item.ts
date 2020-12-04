import { objectType } from "@nexus/schema"

export const Item = objectType({
    name: 'Item',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.state()
        t.model.name()
        t.model.price()
        t.model.sale()
        t.model.option()
        t.model.html()
        t.model.category()
        t.model.Images()
        t.model.Orders()
        t.model.Reviews()
        t.model.Cart()
        t.model.UserLikes()
        t.model.Partner()
        t.model.partnerId()

        t.field('isNew', {
            type: 'Boolean',
            resolve: ({ createdAt }) => Date.now() - createdAt > 1000
        })
    }
})