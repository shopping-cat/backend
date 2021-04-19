import { objectType } from "nexus"

export const Notification = objectType({
    name: 'Notification',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.image()
        t.model.title()
        t.model.content()
        t.model.type()
        t.model.type()
        t.model.userId()
        t.model.user()
    }
})