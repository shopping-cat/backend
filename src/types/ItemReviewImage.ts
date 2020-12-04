import { objectType } from "@nexus/schema"

export const ItemReviewImage = objectType({
    name: 'ItemReviewImage',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.uri()
        t.model.ItemReview()
        t.model.itemReviewId()
    }
})