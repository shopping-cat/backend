import { idArg, intArg, mutationField, nonNull, queryField, stringArg, nullable, extendType } from "nexus"
import asyncDelay from "../../utils/asyncDelay"
import getIUser from "../../utils/getIUser"

// Query - 아이템 세부 정보
export const item = queryField(t => t.nullable.field('item', {
    type: 'Item',
    args: {
        id: nonNull(intArg())
    },
    resolve: async (_, { id }, ctx) => {
        await asyncDelay(1000)
        return ctx.prisma.item.findUnique({
            where: { id }
        })
    }
}))

// Query - 필터링된 아이템
export const filteredItems = queryField(t => t.list.field('filteredItems', {
    type: 'Item',
    args: {
        category: nullable(stringArg({ default: '전체' })),
        keyword: nullable(stringArg()),
        orderBy: nullable(stringArg({ default: '인기순' })),
        offset: nullable(intArg({ default: 0 })),
        limit: nullable(intArg({ default: 15 }))
    },
    resolve: async (_, { category, keyword, orderBy, offset, limit }, ctx) => {
        const items = await ctx.prisma.item.findMany({
            take: limit,
            skip: offset,
            where: {
                category: category && category !== '전체' ? category : undefined,
                name: keyword ? { contains: keyword } : undefined,
                state: 'sale'
            },
            orderBy: {
                price: orderBy === '저가순' ? 'asc' : orderBy === '고가순' ? 'desc' : undefined,
                createdAt: orderBy === '최신순' ? 'desc' : undefined,
                likeNum: orderBy === '인기순' ? 'desc' : undefined
            }
        })
        await asyncDelay(1000)
        return items
    }
}))

// Query - 찜한 아이템 아이템
export const zzimItems = queryField(t => t.list.field('zzimItems', {
    type: 'Item',
    args: {
        category: nullable(stringArg({ default: '전체' })),
        offset: nullable(intArg({ default: 0 })),
        limit: nullable(intArg({ default: 15 }))
    },
    resolve: async (_, { category, offset, limit }, ctx) => {
        const { id } = await getIUser(ctx)
        const user = await ctx.prisma.user.findUnique({
            where: { id },
            include: {
                itemLikes: {
                    take: limit,
                    skip: offset,
                    where: {
                        category: category && category !== '전체' ? category : undefined,
                    }
                }
            }
        })
        if (!user) throw new Error('No User')
        if (!user.itemLikes) return []
        return user.itemLikes
    }
}))


// Query - 추천 아이템
export const recommendedItems = queryField(t => t.list.field('recommendedItems', {
    type: 'Item',
    args: {
        offset: nullable(intArg({ default: 0 })),
        limit: nullable(intArg({ default: 15 }))
    },
    resolve: async (_, { offset, limit }, ctx) => {
        // 일단 인기 순 && 10% 이상 세일 순으로
        const items = await ctx.prisma.item.findMany({
            take: limit,
            skip: offset,
            where: {
                state: 'sale',
                sale: { gte: 10 }
            },
            orderBy: {
                likeNum: 'desc'
            }
        })
        await asyncDelay(1000)
        return items
    }
}))

// Query - 상점별 아이템
export const shopItems = queryField(t => t.list.field('shopItems', {
    type: 'Item',
    args: {
        shopId: nonNull(idArg()),
        orderBy: nullable(stringArg({ default: '인기순' })),
        offset: nullable(intArg({ default: 0 })),
        limit: nullable(intArg({ default: 15 }))
    },
    resolve: async (_, { shopId, orderBy, offset, limit }, ctx) => {
        const items = await ctx.prisma.item.findMany({
            take: limit,
            skip: offset,
            where: {
                partnerId: Number(shopId)
            },
            orderBy: {
                createdAt: orderBy === '최신순' ? 'desc' : undefined,
                likeNum: orderBy === '인기순' ? 'desc' : undefined
            }
        })
        return items
    }
}))
