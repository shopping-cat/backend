import { objectType } from "@nexus/schema"

export const UserRefundBankAccount = objectType({
    name: 'UserRefundBankAccount',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.bankName()
        t.model.accountNumber()
        t.model.ownerName()
        t.model.User()
        t.model.userId()
    }
})