import { intArg, nonNull, queryField } from "nexus"
import asyncDelay from "../../utils/asyncDelay"

export const event = queryField(t => t.field('event', {
    type: 'Event',
    args: {
        id: nonNull(intArg())
    },
    resolve: async (_, { id }, ctx) => {
        await asyncDelay()
        return ctx.prisma.event.findUnique({
            where: { id }
        })
    }
}))

export const events = queryField(t => t.list.field('events', {
    type: 'Event',
    resolve: async (_, { }, ctx) => {
        await asyncDelay(1000)
        return ctx.prisma.event.findMany({
            where: {
                period: { gt: new Date() }
            }
        })
    }
}))