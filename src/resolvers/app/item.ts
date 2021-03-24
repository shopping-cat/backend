import { Item } from "@prisma/client"
import { idArg, intArg, mutationField, nonNull, queryField, stringArg, nullable, extendType, booleanArg, list } from "nexus"
import asyncDelay from "../../utils/asyncDelay"
import errorFormat from "../../utils/errorFormat"
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
        category1: nullable(stringArg()),
        category2: nullable(stringArg()),
        keyword: nullable(stringArg()),
        orderBy: nullable(stringArg({ default: '인기순' })),
        offset: nullable(intArg({ default: 0 })),
        limit: nullable(intArg({ default: 15 }))
    },
    resolve: async (_, { category1, category2, keyword, orderBy, offset, limit }, ctx) => {
        if (keyword) { // 최근 검색어에 추가
            const user = await getIUser(ctx)
            const searchKeyword = await ctx.prisma.searchKeyword.findFirst({
                where: {
                    keyword,
                    userId: user.id
                }
            })
            if (searchKeyword) { // 이미 똑같은 키워드가 있다면 삭제
                await ctx.prisma.searchKeyword.delete({
                    where: { id: searchKeyword.id }
                })
            }
            await ctx.prisma.searchKeyword.create({
                data: {
                    keyword,
                    user: { connect: { id: user.id } }
                }
            })
        }
        const items = await ctx.prisma.item.findMany({
            take: limit,
            skip: offset,
            where: {
                category1,
                category2,
                name: keyword ? { contains: keyword } : undefined,
                state: '판매중'
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

// Query - 필터링된 아이템 갯수
export const filteredItemsCount = queryField(t => t.field('filteredItemsCount', {
    type: 'Int',
    args: {
        category1: nullable(stringArg()),
        category2: nullable(stringArg()),
        keyword: nullable(stringArg()),
    },
    resolve: async (_, { category1, category2, keyword }, ctx) => {
        const count = await ctx.prisma.item.count({
            where: {
                category1,
                category2,
                name: keyword ? { contains: keyword } : undefined,
                state: '판매중'
            }
        })
        return count
    }
}))

// Query - 찜한 아이템 아이템
export const zzimItems = queryField(t => t.list.field('zzimItems', {
    type: 'Item',
    args: {
        category1: nullable(stringArg()),
        category2: nullable(stringArg()),
        offset: nullable(intArg({ default: 0 })),
        limit: nullable(intArg({ default: 15 }))
    },
    resolve: async (_, { category1, category2, offset, limit }, ctx) => {
        await asyncDelay()
        console.log('zzim')
        const { id } = await getIUser(ctx)
        const user = await ctx.prisma.user.findUnique({
            where: { id },
            include: {
                itemLikes: {
                    take: limit,
                    skip: offset,
                    where: {
                        category1,
                        category2,
                        state: { in: ['판매중', '재고없음'] }
                    }
                }
            }
        })
        if (!user) throw errorFormat('로그인이 필요한 작업입니다')
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
                state: '판매중',
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
        shopId: nonNull(intArg()),
        orderBy: nullable(stringArg({ default: '인기순' })),
        offset: nullable(intArg({ default: 0 })),
        limit: nullable(intArg({ default: 15 }))
    },
    resolve: async (_, { shopId, orderBy, offset, limit }, ctx) => {
        await asyncDelay()
        const items = await ctx.prisma.item.findMany({
            take: limit,
            skip: offset,
            where: {
                shopId,
                state: '판매중'
            },
            orderBy: {
                createdAt: orderBy === '최신순' ? 'desc' : undefined,
                likeNum: orderBy === '인기순' ? 'desc' : undefined
            }
        })
        return items
    }
}))

// Mutation - 아이템 좋아요
export const likeItem = mutationField(t => t.field('likeItem', {
    type: 'Item',
    args: {
        itemId: nonNull(intArg()),
        like: nonNull(booleanArg()) // 좋아요 누른거면 true 아니면 false
    },
    resolve: async (_, { itemId, like }, ctx) => {
        await asyncDelay()
        const user = await getIUser(ctx)
        if (like) {
            await ctx.prisma.user.update({
                where: { id: user.id },
                data: {
                    itemLikes: {
                        connect: {
                            id: itemId
                        }
                    }
                }
            })
        } else {
            await ctx.prisma.user.update({
                where: { id: user.id },
                data: {
                    itemLikes: {
                        disconnect: {
                            id: itemId
                        }
                    }
                }
            })
        }

        const likeNum = await ctx.prisma.user.count({
            where: {
                itemLikes: {
                    some: {
                        id: itemId
                    }
                }
            }
        })
        const item = await ctx.prisma.item.update({
            where: { id: itemId },
            data: {
                likeNum
            }
        })
        return item
    }
}))

// Mutation -  zzim리스트 삭제
export const unlikeItems = mutationField(t => t.list.field('unlikeItems', {
    type: 'Item',
    args: {
        itemIds: list(intArg())
    },
    resolve: async (_, { itemIds }, ctx) => {
        try {
            await asyncDelay()
            const user = await getIUser(ctx)
            const items: Item[] = []
            for (const itemId of itemIds) {
                try {
                    await ctx.prisma.item.update({
                        where: { id: itemId },
                        data: {
                            userLikes: {
                                disconnect: {
                                    id: user.id
                                }
                            }
                        }
                    })
                } catch (error) {

                }
                const likeNum = await ctx.prisma.user.count({
                    where: {
                        itemLikes: {
                            some: {
                                id: itemId
                            }
                        }
                    }
                })
                const item = await ctx.prisma.item.update({
                    where: { id: itemId },
                    data: {
                        likeNum
                    }
                })
                items.push(item)
            }
            return items
        } catch (error) {
            console.error(error)
            throw error
        }
    }
}))