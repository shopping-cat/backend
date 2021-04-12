import dayjs from "dayjs"
import { idArg, mutationField, nonNull, queryField, stringArg } from "nexus"
import errorFormat from "../../utils/errorFormat"
import getISeller from "../../utils/getISeller"
import { COMMISSION } from "../../values"

export const profitReceipts = queryField(t => t.list.field('profitReceipts', {
    type: 'ProfitReceipt',
    resolve: async (_, { }, ctx) => {
        const seller = await getISeller(ctx)
        const profitReceipts = await ctx.prisma.profitReceipt.findMany({
            where: {
                shopId: seller.shopId
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        // TODO offset limit
        return profitReceipts
    }
}))

export const monthlyProfit = queryField(t => t.list.field('monthlyProfit', {
    type: 'Int',
    resolve: async (_, { }, ctx) => {

        const seller = await getISeller(ctx)
        const result: number[] = []

        for (let i = 0; i < 6; i++) {
            const currentDate = dayjs()
                .add(-i, 'month')
                .set('date', 1)
                .set('hour', 0)
                .set('minute', 0)
                .set('second', 0)

            const { sum } = await ctx.prisma.profitReceipt.aggregate({
                where: {
                    AND: [{
                        // 다음달 1일 보다 작게
                        createdAt: { lt: currentDate.add(1, 'month').toDate() }
                    }, {
                        // 그달의 1일
                        createdAt: { gte: currentDate.toDate() }
                    },
                    { shopId: seller.shopId },
                    { state: '정산완료' }
                    ]
                },
                sum: {
                    price: true
                }
            })
            result.push(sum.price)
        }

        return result.reverse()
    }
}))

export const createProfitReceipt = mutationField(t => t.field('createProfitReceipt', {
    type: 'ProfitReceipt',
    resolve: async (_, { }, ctx) => {

        const seller = await getISeller(ctx)

        const orders = await ctx.prisma.order.findMany({
            where: {
                item: { shopId: seller.shopId },
                state: '구매확정',
                profitReceipt: null
            }
        })

        const profitReceipt = await ctx.prisma.profitReceipt.findFirst({
            where: {
                shopId: seller.shopId,
                state: '정산요청'
            }
        })

        const totalPrice = orders.reduce((prev, current) => prev + current.totalPrice, 0)
        const price = Math.floor(totalPrice * (100 - COMMISSION) / 100)
        const commission = totalPrice - price

        if (profitReceipt) throw errorFormat('정산은 한번에 하나씩만 가능합니다')
        if (orders.length === 0) throw errorFormat('정산 가능한 주문이 없습니다')

        const createdProfitReceipt = await ctx.prisma.profitReceipt.create({
            data: {
                shop: { connect: { id: seller.shopId } },
                price,
                commission,
                orders: { connect: orders.map(v => ({ id: v.id })) }
            }
        })

        return createdProfitReceipt
    }
}))