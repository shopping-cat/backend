import { intArg, nullable, queryField } from "nexus"
import asyncDelay from "../../utils/asyncDelay"
import getIUser from "../../utils/getIUser"

// Query - 유저의 유효한 쿠폰 리스트
export const pointReceipts = queryField(t => t.list.field('pointReceipts', {
    type: 'PointReceipt',
    args: {
        offset: nullable(intArg({ default: 0 })),
        limit: nullable(intArg({ default: 10 }))
    },
    resolve: async (_, { offset, limit }, ctx) => {
        await asyncDelay()

        const user = await getIUser(ctx)

        const pointReceipts = await ctx.prisma.pointReceipt.findMany({
            take: limit,
            skip: offset,
            where: {
                userId: user.id,
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return pointReceipts
    }
}))