import { objectType } from "nexus"

export const PointReceipt = objectType({
    name: 'PointReceipt',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.name()
        t.model.point()
        t.model.user()
    }
})