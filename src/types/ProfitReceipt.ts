import { objectType } from "nexus"

export const ProfitReceipt = objectType({
    name: 'ProfitReceipt',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.commission()
        t.model.price()
        t.model.shopId()
        t.model.shop()
        t.model.orders()
    }
})

export type ProfitReceiptState = '정산요청' | '정산완료'