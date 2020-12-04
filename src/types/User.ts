import { objectType } from "@nexus/schema"

export const User = objectType({
    name: 'User',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.email()
        t.model.coupons()
        t.model.orders()
        t.model.payments()
        t.model.refundBankAccount()
        t.model.itemReviews()
        t.model.itemReviewLikes()
        t.model.itemReviewUnlikes()
        t.model.itemLikes()
        t.model.cart()
        t.model.searchKeywords()
    }
})
