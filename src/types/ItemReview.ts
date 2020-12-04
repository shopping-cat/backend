import { objectType } from "@nexus/schema"

export const ItemReview = objectType({
    name: 'ItemReview',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.content()
        t.model.rate()
        t.model.UserLikes()
        t.model.UserUnlikes()
        t.model.Images()
        t.model.User()
        t.model.Item()
        t.model.orderId()
        t.model.userId()
        t.model.itemId()
        t.model.orderId()
    }
})
