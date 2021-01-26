import { idArg, intArg, mutationField, nonNull, queryField, stringArg, nullable } from "nexus"
import getIUser from "../../utils/getIUser"

// Mutation - 아이템 생성
export const createItem = mutationField(t => t.field('createItem', {
    type: 'Item',
    args: {
        category: nonNull(stringArg()),
        html: nonNull(stringArg()),
        name: nonNull(stringArg()),
        option: nonNull(stringArg()),
        price: nonNull(intArg())
    },
    resolve: async (_, { category, html, name, option, price }, ctx) => {
        const item = await ctx.prisma.item.create({
            data: {
                category,
                html,
                name,
                option,
                price,
                partner: { connect: { email: '123@gmail.com' } }
            }
        })
        return item
    }
}))