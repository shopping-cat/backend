import { objectType } from "@nexus/schema"

export const User = objectType({
    name: 'User',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.email()
        t.model.Coupons()
        t.model.Orders()
        t.model.Payments()
        t.model.RefundBankAccount()
        t.model.ItemReviews()
        t.model.ItemReviewLikes()
        t.model.ItemReviewUnlikes()
        t.model.ItemLikes()
        t.model.Cart()
        t.model.SearchKeywords()
    }
})
