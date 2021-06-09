import { Item } from "@prisma/client"
import dayjs from "dayjs"
import { idArg, intArg, mutationField, nonNull, queryField, stringArg, nullable, extendType, booleanArg, list, objectType } from "nexus"
import endOfTheDate from "../../utils/endOfTheDate"

import errorFormat from "../../utils/errorFormat"
import getIUser from "../../utils/getIUser"
import getType from "../../utils/getType"
import isCat from "../../utils/isCat"
import startOfTheDate from "../../utils/startOfTheDate"

// Query - 아이템 세부 정보
export const item = queryField(t => t.nullable.field('item', {
    type: 'Item',
    args: {
        id: nonNull(intArg())
    },
    resolve: async (_, { id }, ctx) => {


        const item = await ctx.prisma.item.findUnique({ where: { id } })

        const user = await getIUser(ctx, true)

        if (user) { // 최근 검색어 추가
            const userRecentViewItems = await ctx.prisma.userRecentViewItem.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' }
            })

            if (!item) throw errorFormat('존재하지 않는 상품 입니다')

            // 중복 제거
            const filteredUserRecentViewItems = userRecentViewItems.filter(v => v.itemId === id)
            if (filteredUserRecentViewItems.length > 0) {
                await ctx.prisma.userRecentViewItem.delete({ where: { id: filteredUserRecentViewItems[0].id } })
            }
            // 중복제거 후에 상품이 20개 이상이면 이상인 만큼 삭제
            const deletedUserRecentViewItmes = userRecentViewItems.filter(v => v.itemId !== id)
            if (deletedUserRecentViewItmes.length >= 20) {
                await ctx.prisma.userRecentViewItem.deleteMany({ where: { id: { in: deletedUserRecentViewItmes.slice(20 - 1).map(v => v.id) } } })
            }
            // 최근 검색에 추가
            await ctx.prisma.userRecentViewItem.create({
                data: {
                    user: { connect: { id: user.id } },
                    item: { connect: { id: item.id } }
                }
            })
        }

        return item
    }
}))

export const homeItemType = objectType({
    name: 'homeItemsType',
    definition: (t) => {
        t.nonNull.string('type')
        t.nonNull.string('title')
        t.nullable.list.field('items', {
            type: 'Item'
        })
    }
})
// 홈화면에 보여줄 아이템 세트들
export const homeItems = queryField(t => t.list.field('homeItems', {
    type: homeItemType,
    resolve: async (_, { }, ctx) => {

        const type = getType(ctx)

        const list: {
            type: string
            title: string
            items: Item[]
        }[] = []

        const [todayPopular, userRecentViewItem, newSale, saleUntilToday] = await Promise.all([
            ctx.prisma.order.groupBy({
                by: ['itemId'],
                where: {
                    createdAt: { gte: dayjs().add(-1, 'day').toDate() },
                    state: { in: ['구매접수', '배송중'] },
                    item: { type: { in: [type, 'both'] }, shop: { state: '정상' }, }
                },
                count: true,
                orderBy: {
                    _count: {
                        itemId: 'desc'
                    },
                },
                take: 10
            }),
            (async () => {
                try {
                    const user = await getIUser(ctx)
                    const items = await ctx.prisma.userRecentViewItem.findMany({
                        where: { userId: user.id, item: { type: { in: [type, 'both'] }, shop: { state: '정상' }, } },
                        include: { item: true },
                        orderBy: { createdAt: 'desc' },
                        take: 10
                    })
                    return items
                } catch (error) {
                    return []
                }
            })(),
            ctx.prisma.item.findMany({
                where: {
                    state: '판매중',
                    shop: { state: '정상' },
                    AND: [
                        { saleStartDate: { gte: startOfTheDate(new Date()) } },
                        { saleStartDate: { lte: endOfTheDate(new Date()) } }
                    ],
                    type: { in: [type, 'both'] }
                },
                orderBy: {
                    sale: 'desc'
                },
                take: 10
            }),
            ctx.prisma.item.findMany({
                where: {
                    state: '판매중',
                    shop: { state: '정상' },
                    AND: [
                        { saleEndDate: { gte: startOfTheDate(new Date()) } },
                        { saleEndDate: { lte: endOfTheDate(new Date()) } }
                    ],
                    type: { in: [type, 'both'] }
                },
                orderBy: {
                    sale: 'desc'
                },
                take: 10
            })
        ])

        list.push({
            type: 'itemList',
            title: '오늘 인기 상품',
            items: (await ctx.prisma.item.findMany({
                where: {
                    id: { in: todayPopular.map(v => v.itemId) }
                }
                //@ts-ignore
            })).sort((a, b) => (todayPopular.find(v => v.itemId === b.id)?.count || 0) - (todayPopular.find(v => v.itemId === a.id)?.count || 0))
        })
        // list.push({
        //     type: 'itemList',
        //     title: '광고',
        //     items: [] // TODO
        // })
        list.push({
            type: 'itemList',
            title: '최근 본 상품',
            items: userRecentViewItem.map(v => v.item)
        })
        list.push({
            type: 'itemList',
            title: '신규 세일',
            items: newSale
        })
        list.push({
            type: 'itemList',
            title: '오늘까지 세일',
            items: saleUntilToday
        })

        return list.filter(v => v.items.length !== 0)
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
        const user = await getIUser(ctx, true)

        if (keyword && user) { // 최근 검색어에 추가
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
            take: limit || 15,
            skip: offset || 0,
            where: {
                category1: category1 || undefined,
                category2: category2 || undefined,
                name: keyword ? { contains: keyword } : undefined,
                state: '판매중',
                shop: { state: '정상' },
                type: { in: [getType(ctx), 'both'] }
            },
            orderBy: {
                price: orderBy === '저가순' ? 'asc' : orderBy === '고가순' ? 'desc' : undefined,
                createdAt: orderBy === '최신순' ? 'desc' : undefined,
                likeNum: orderBy === '인기순' ? 'desc' : undefined
            }
        })

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
                category1: category1 || undefined,
                category2: category2 || undefined,
                name: keyword ? { contains: keyword } : undefined,
                state: '판매중',
                shop: { state: '정상' },
                type: { in: [getType(ctx), 'both'] }
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

        const { id } = await getIUser(ctx)
        const user = await ctx.prisma.user.findUnique({
            where: { id },
            include: {
                itemLikes: {
                    take: limit || 15,
                    skip: offset || 0,
                    where: {
                        category1: category1 || undefined,
                        category2: category2 || undefined,
                        state: { in: ['판매중', '재고없음'] },
                        type: { in: [getType(ctx), 'both'] },
                        shop: { state: '정상' },
                    }
                }
            }
        })
        if (!user) throw errorFormat('로그인이 필요한 작업입니다')
        if (!user.itemLikes) return []
        return user.itemLikes
    }
}))


// Query - 추천 아이템 no use
export const recommendedItems = queryField(t => t.list.field('recommendedItems', {
    type: 'Item',
    args: {
        offset: nullable(intArg({ default: 0 })),
        limit: nullable(intArg({ default: 15 }))
    },
    resolve: async (_, { offset, limit }, ctx) => {
        // 일단 인기 순 && 10% 이상 세일 순으로
        const items = await ctx.prisma.item.findMany({
            take: limit || 15,
            skip: offset || 0,
            where: {
                state: '판매중',
                sale: { gte: 10 },
                type: { in: [getType(ctx), 'both'] },
                shop: { state: '정상' },
            },
            orderBy: {
                likeNum: 'desc'
            }
        })

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

        const items = await ctx.prisma.item.findMany({
            take: limit || 15,
            skip: offset || 0,
            where: {
                shopId,
                state: { in: ['판매중', '재고없음'] },
                type: { in: [getType(ctx), 'both'] },
                shop: { state: '정상' },
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
        itemIds: nonNull(list(nonNull(intArg())))
    },
    resolve: async (_, { itemIds }, ctx) => {
        try {

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