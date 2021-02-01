import { intArg, nonNull, queryField } from "nexus"
import asyncDelay from "../../utils/asyncDelay"

// Query - 상점 세부 정보
export const partner = queryField(t => t.nullable.field('partner', {
    type: 'Partner',
    args: {
        id: nonNull(intArg())
    },
    resolve: async (_, { id }, ctx) => {
        await asyncDelay(1000)
        return ctx.prisma.partner.findUnique({
            where: { id }
        })
    }
}))
