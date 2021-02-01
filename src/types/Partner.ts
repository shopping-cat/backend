import { intArg, nullable, objectType, stringArg } from "nexus"

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
        t.field('rate', {
            type: 'Float',
            resolve: async ({ id }, _, ctx) => {
                const { avg } = await ctx.prisma.itemReview.aggregate({
                    avg: { rate: true },
                    where: { item: { partnerId: id } }
                })
                return Number(avg.rate.toFixed(1))
            }
        })
        t.field('rateNum', {
            type: 'Int',
            resolve: async ({ id }, _, ctx) => {
                return ctx.prisma.itemReview.count({ where: { item: { partnerId: id } } })
            }
        })
        t.field('itemNum', {
            type: 'Int',
            resolve: async ({ id }, _, ctx) => {
                return ctx.prisma.item.count({ where: { partnerId: id } })
            }
        })
    }
})