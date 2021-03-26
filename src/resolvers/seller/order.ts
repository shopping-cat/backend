import { intArg, nullable, queryField } from "nexus";
import getISeller from "../../utils/getISeller";

export const newOrders = queryField(t => t.list.field('newOrders', {
    type: 'Order',
    args: {
        limit: nullable(intArg({ default: 10 })),
        offset: nullable(intArg({ default: 0 }))
    },
    resolve: async (_, { limit, offset }, ctx) => {
        const seller = await getISeller(ctx)
        const orders = await ctx.prisma.order.findMany({
            where: {
                item: { shopId: seller.shopId },
                state: '구매접수',
                payment: { state: '정상처리' },
            },
            orderBy: {
                updatedAt: 'desc'
            },
            skip: offset,
            take: limit
        })
        return orders
    }
}))

export const onDeliveryOrders = queryField(t => t.list.field('onDeliveryOrders', {
    type: 'Order',
    args: {
        limit: nullable(intArg({ default: 10 })),
        offset: nullable(intArg({ default: 0 }))
    },
    resolve: async (_, { limit, offset }, ctx) => {
        const seller = await getISeller(ctx)
        const orders = await ctx.prisma.order.findMany({
            where: {
                item: { shopId: seller.shopId },
                state: '배송중',
                payment: { state: '정상처리' },
            },
            orderBy: {
                updatedAt: 'desc'
            },
            skip: offset,
            take: limit
        })
        return orders
    }
}))

export const completedDeliveryOrders = queryField(t => t.list.field('completedDeliveryOrders', {
    type: 'Order',
    args: {
        limit: nullable(intArg({ default: 10 })),
        offset: nullable(intArg({ default: 0 }))
    },
    resolve: async (_, { limit, offset }, ctx) => {
        const seller = await getISeller(ctx)
        const orders = await ctx.prisma.order.findMany({
            where: {
                item: { shopId: seller.shopId },
                state: '배송완료',
                payment: { state: '정상처리' },
            },
            orderBy: {
                updatedAt: 'desc'
            },
            skip: offset,
            take: limit
        })
        return orders
    }
}))

export const confirmedOrders = queryField(t => t.list.field('confirmedOrders', {
    type: 'Order',
    args: {
        limit: nullable(intArg({ default: 10 })),
        offset: nullable(intArg({ default: 0 }))
    },
    resolve: async (_, { limit, offset }, ctx) => {
        const seller = await getISeller(ctx)
        const orders = await ctx.prisma.order.findMany({
            where: {
                item: { shopId: seller.shopId },
                state: '구매확정',
                payment: { state: '정상처리' },
            },
            orderBy: {
                updatedAt: 'desc'
            },
            skip: offset,
            take: limit
        })
        return orders
    }
}))

export const refundRequestOrders = queryField(t => t.list.field('refundRequestOrders', {
    type: 'Order',
    args: {
        limit: nullable(intArg({ default: 10 })),
        offset: nullable(intArg({ default: 0 }))
    },
    resolve: async (_, { limit, offset }, ctx) => {
        const seller = await getISeller(ctx)
        const orders = await ctx.prisma.order.findMany({
            where: {
                item: { shopId: seller.shopId },
                state: '환불중',
                payment: { state: '정상처리' },
            },
            orderBy: {
                updatedAt: 'desc'
            },
            skip: offset,
            take: limit
        })
        return orders
    }
}))


export const exchangeRequestOrders = queryField(t => t.list.field('exchangeRequestOrders', {
    type: 'Order',
    args: {
        limit: nullable(intArg({ default: 10 })),
        offset: nullable(intArg({ default: 0 }))
    },
    resolve: async (_, { limit, offset }, ctx) => {
        const seller = await getISeller(ctx)
        const orders = await ctx.prisma.order.findMany({
            where: {
                item: { shopId: seller.shopId },
                state: '환불처리',
                payment: { state: '정상처리' },
            },
            orderBy: {
                updatedAt: 'desc'
            },
            skip: offset,
            take: limit
        })
        return orders
    }
}))

export const refundedOrders = queryField(t => t.list.field('refundedOrders', {
    type: 'Order',
    args: {
        limit: nullable(intArg({ default: 10 })),
        offset: nullable(intArg({ default: 0 }))
    },
    resolve: async (_, { limit, offset }, ctx) => {
        const seller = await getISeller(ctx)
        const orders = await ctx.prisma.order.findMany({
            where: {
                item: { shopId: seller.shopId },
                state: '구매확정',
                payment: { state: '정상처리' },
            },
            orderBy: {
                updatedAt: 'desc'
            },
            skip: offset,
            take: limit
        })
        return orders
    }
}))

export const exchangedOrders = queryField(t => t.list.field('exchangedOrders', {
    type: 'Order',
    args: {
        limit: nullable(intArg({ default: 10 })),
        offset: nullable(intArg({ default: 0 }))
    },
    resolve: async (_, { limit, offset }, ctx) => {
        const seller = await getISeller(ctx)
        const orders = await ctx.prisma.order.findMany({
            where: {
                item: { shopId: seller.shopId },
                state: '교환처리',
                payment: { state: '정상처리' },
            },
            orderBy: {
                updatedAt: 'desc'
            },
            skip: offset,
            take: limit
        })
        return orders
    }
}))