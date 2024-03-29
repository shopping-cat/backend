import { intArg, nullable, objectType, stringArg } from "nexus"

export const Partner = objectType({
    name: 'Partner',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.email()
        t.model.licenseNumber()
        t.model.shopId()
        t.model.shop()
    }
})