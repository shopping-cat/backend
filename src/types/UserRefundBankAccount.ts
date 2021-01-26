import { objectType } from "nexus"

export const UserRefundBankAccount = objectType({
    name: 'UserRefundBankAccount',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.bankName()
        t.model.accountNumber()
        t.model.ownerName()
        t.model.user()
        t.model.userId()
    }
})