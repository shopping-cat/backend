import { objectType } from "@nexus/schema"

export const Partner = objectType({
    name: 'Partner',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.email()
        t.model.shopName()
        t.model.licenseNumber()
        t.model.shopImage()
        t.model.item()
    }
})