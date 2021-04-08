import { objectType } from "nexus"

export const Event = objectType({
    name: 'Event',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.period()
        t.model.bannerImage()
        t.model.html()
    }
})