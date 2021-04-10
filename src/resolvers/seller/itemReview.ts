import { intArg, nonNull, nullable, queryField, stringArg } from "nexus"

import getISeller from "../../utils/getISeller"

// Query - 해당 상품의 리뷰들 가져오기
export const itemReviews = queryField(t => t.list.field('itemReviews', {
    type: 'ItemReview',
    args: {
        itemId: nonNull(intArg())
    },
    resolve: async (_, { itemId }, ctx) => {

        await getISeller(ctx)
        const itemReviews = await ctx.prisma.itemReview.findMany({
            where: { itemId },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return itemReviews
    }
}))