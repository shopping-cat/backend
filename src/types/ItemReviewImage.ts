import { objectType } from "nexus"

export const ItemReviewImage = objectType({
    name: 'ItemReviewImage',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.uri()
        t.model.itemReview()
        t.model.itemReviewId()
    }
})