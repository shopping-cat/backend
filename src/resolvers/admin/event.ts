import dayjs from "dayjs"
import { inputObjectType, mutationField, nonNull, queryField } from "nexus"
import xss from "xss"

export const createEvent = mutationField(t => t.field('createEvent', {
    type: 'Event',
    args: {
        input: nonNull(inputObjectType({
            name: 'CreateEventInput',
            definition: (t) => {
                t.nonNull.string('period')
                t.nonNull.string('bannerImage')
                t.nonNull.string('html')
            }
        }))
    },
    resolve: async (_, { input }, ctx) => {

        const { period, bannerImage, html } = input

        return ctx.prisma.event.create({
            data: {
                bannerImage,
                period: dayjs(period + '235959', 'YYYYMMDDHHmmss').toDate(),
                html: xss(html)
            }
        })
    }
}))