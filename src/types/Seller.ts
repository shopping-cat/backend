import { intArg, nullable, objectType, stringArg } from "nexus"

export const Seller = objectType({
    name: 'Seller',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.email()
        t.model.licenseNumber()
        t.model.bizRegistration()
        t.model.bizType()
        t.model.shopId()
        t.model.shop()
    }
})