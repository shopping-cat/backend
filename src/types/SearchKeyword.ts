import { objectType } from "nexus"

export const SearchKeyword = objectType({
    name: 'SearchKeyword',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.keyword()
        t.model.user()
        t.model.userId()
    }
})