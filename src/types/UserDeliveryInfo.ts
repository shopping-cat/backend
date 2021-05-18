import { objectType } from "nexus"
import isExtraDeliveryPriceAddress from "../utils/isExtraDeliveryPriceAddress"

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
        t.field('isExtraDeliveryPriceAddress', {
            type: 'Boolean',
            resolve: ({ postCode }, { }, _) => {
                return isExtraDeliveryPriceAddress(postCode)
            }
        })
    }
})