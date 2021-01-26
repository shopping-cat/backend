import { objectType } from "nexus"

export const Item = objectType({
    name: 'Item',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.likeNum()
        t.model.state()
        t.model.name()
        t.model.price()
        t.model.sale()
        t.model.option()
        t.model.html()
        t.model.category()
        t.model.images()
        t.model.orders()
        t.model.reviews()
        t.model.cart()
        t.model.userLikes()
        t.model.partner()
        t.model.partnerId()
        t.field('rate', { //TODO
            type: 'Float',
            resolve: () => 4.5
        })
        t.field('sellingPrice', {
            type: 'Int',
            resolve: ({ sale, price }) => Math.floor(price * sale / 100)
        })
        t.field('isNew', {
            type: 'Boolean',
            resolve: ({ createdAt }) => (Date.now() - createdAt.getTime()) > 1000
        })
    }
})