import { objectType } from "@nexus/schema"

export const ItemImage = objectType({
    name: 'ItemImage',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.uri()
        t.model.item()
        t.model.itemId()
    }
})