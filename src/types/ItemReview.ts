import { objectType } from "@nexus/schema"

export const ItemReview = objectType({
    name: 'ItemReview',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.content()
        t.model.rate()
        t.model.userLikes()
        t.model.userUnlikes()
        t.model.images()
        t.model.user()
        t.model.item()
        t.model.orderId()
        t.model.userId()
        t.model.itemId()
        t.model.orderId()
    }
})
