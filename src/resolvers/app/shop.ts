import { intArg, nonNull, queryField } from "nexus"


// Query - 상점 세부 정보
export const shop = queryField(t => t.nullable.field('shop', {
    type: 'Shop',
    args: {
        id: nonNull(intArg())
    },
    resolve: async (_, { id }, ctx) => {

        return ctx.prisma.shop.findUnique({
            where: { id }
        })
    }
}))
