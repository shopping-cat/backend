import { intArg, nonNull, queryField, stringArg } from "nexus"

export const payments = queryField(t => t.list.field('payments', {
    type: 'Payment',
    resolve: async (_, { }, ctx) => {
        const payments = await ctx.prisma.payment.findMany({
            where: { state: { notIn: ['결제요청', '결제취소'] } },
            orderBy: {
                id: 'desc'
            }
        })
        return payments
    }
}))

export const payment = queryField(t => t.field('payment', {
    type: 'Payment',
    args: {
        id: nonNull(stringArg())
    },
    resolve: async (_, { id }, ctx) => {
        const payment = await ctx.prisma.payment.findUnique({
            where: { id }
        })
        return payment
    }
}))