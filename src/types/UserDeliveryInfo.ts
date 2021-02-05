import { objectType } from "nexus"

export const UserDeliveryInfo = objectType({
    name: 'UserDeliveryInfo',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.postCode()
        t.model.address()
        t.model.addressDetail()
        t.model.name()
        t.model.phone()
        t.model.user()
        t.model.userId()
        // 산간지역 계산 TODO
    }
})