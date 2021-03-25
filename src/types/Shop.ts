import { intArg, nullable, objectType, stringArg } from "nexus"

export const Shop = objectType({
    name: 'Shop',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.shopName()
        t.model.shopImage()
        t.model.items()
        t.model.seller()
        t.field('rate', {
            type: 'Float',
            resolve: async ({ id }, _, ctx) => {
                const { avg } = await ctx.prisma.itemReview.aggregate({
                    avg: { rate: true },
                    where: { item: { shopId: id } }
                })
                return Number(avg.rate.toFixed(1))
            }
        })
        t.field('rateNum', {
            type: 'Int',
            resolve: async ({ id }, _, ctx) => {
                return ctx.prisma.itemReview.count({ where: { item: { shopId: id } } })
            }
        })
        t.field('itemNum', {
            type: 'Int',
            resolve: async ({ id }, _, ctx) => {
                return ctx.prisma.item.count({ where: { shopId: id } })
            }
        })
    }
})