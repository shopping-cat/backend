import { intArg, nonNull, queryField } from "nexus"

export const event = queryField(t => t.field('event', {
    type: 'Event',
    args: {
        id: nonNull(intArg())
    },
    resolve: async (_, { id }, ctx) => {

        return ctx.prisma.event.findUnique({
            where: { id }
        })
    }
}))

export const events = queryField(t => t.list.field('events', {
    type: 'Event',
    resolve: async (_, { }, ctx) => {

        return ctx.prisma.event.findMany({
            where: {
                period: { gt: new Date() }
            }
        })
    }
}))