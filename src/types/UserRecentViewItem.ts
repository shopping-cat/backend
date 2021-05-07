import { objectType } from "nexus"

export const UserRecentViewItem = objectType({
    name: 'UserRecentViewItem',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.itemId()
        t.model.userId()
        t.model.item()
        t.model.user()
    }
})