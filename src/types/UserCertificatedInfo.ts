import { objectType } from "nexus"

export const UserCertificatedInfo = objectType({
    name: 'UserCertificatedInfo',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.phone()
        t.model.userId()
        t.model.user()
    }
})