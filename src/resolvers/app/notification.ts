import { intArg, nullable, queryField } from "nexus"
import asyncDelay from "../../utils/asyncDelay"
import getIUser from "../../utils/getIUser"

export const notifications = queryField(t => t.list.field('notifications', {
    type: 'Notification',
    args: {
        offset: nullable(intArg({ default: 0 })),
        limit: nullable(intArg({ default: 10 }))
    },
    resolve: async (_, { offset, limit }, ctx) => {
        const user = await getIUser(ctx)
        const notifications = await ctx.prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        })

        // checked 전부다 true로 변환
        await ctx.prisma.notification.updateMany({
            where: {
                userId: user.id,
                checked: false
            },
            data: {
                checked: true
            }
        })

        return notifications
    }
}))
