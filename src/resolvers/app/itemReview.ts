import { intArg, nullable, queryField, stringArg, nonNull } from "nexus"
import asyncDelay from "../../utils/asyncDelay"

// Query - 내 정보를 가져옴
export const itemReviews = queryField(t => t.list.field('itemReviews', {
    type: 'ItemReview',
    args: {
        itemId: nonNull(intArg()),
        orderBy: nonNull(stringArg()),
        offset: nullable(intArg({ default: 0 })),
        limit: nullable(intArg({ default: 10 }))
    },
    resolve: async (_, { itemId, orderBy, offset, limit }, ctx) => {
        await asyncDelay()
        const itemReviews = ctx.prisma.itemReview.findMany({
            take: limit,
            skip: offset,
            where: { itemId },
            orderBy: {
                createdAt: orderBy === '최신순' ? 'desc' : undefined,
                likeNum: orderBy === '추천순' ? 'desc' : undefined
            }
        })
        return itemReviews
    }
}))
