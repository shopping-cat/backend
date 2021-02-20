import { intArg, nullable, queryField, stringArg, nonNull, mutationField } from "nexus"
import asyncDelay from "../../utils/asyncDelay"
import getIUser from "../../utils/getIUser"

// Query - 해당 상품의 리뷰들 가져오기
export const itemReviews = queryField(t => t.list.field('itemReviews', {
    type: 'ItemReview',
    args: {
        itemId: nonNull(intArg()),
        orderBy: nonNull(stringArg()),
        offset: nullable(intArg({ default: 0 })),
        limit: nullable(intArg({ default: 10 }))
    },
    resolve: async (_, { itemId, orderBy, offset, limit }, ctx) => {
        await asyncDelay()
        const itemReviews = ctx.prisma.itemReview.findMany({
            take: limit,
            skip: offset,
            where: { itemId },
            orderBy: {
                createdAt: orderBy === '최신순' ? 'desc' : undefined,
                likeNum: orderBy === '추천순' ? 'desc' : undefined
            }
        })
        return itemReviews
    }
}))

// Query - 내 작성가능한 리뷰들을 가져옴
export const createableItemReviews = queryField(t => t.list.field('createableItemReviews', {
    type: 'Order',
    args: {
        offset: nullable(intArg({ default: 0 })),
        limit: nullable(intArg({ default: 10 }))
    },
    resolve: async (_, { offset, limit }, ctx) => {
        await asyncDelay()
        const user = await getIUser(ctx)
        // await ctx.prisma.order.create({
        //     data: {
        //         address: 'dummy',
        //         item: { connect: { id: 3 } },
        //         num: 1,
        //         payment: { connect: { id: 1 } },
        //         phone: 'dummy',
        //         pointSale: 0,
        //         state: '배송완료',
        //         user: {
        //             connect: { id: user.id }
        //         },
        //         deliveryCompletionDate: new Date
        //     }
        // })
        const orders = await ctx.prisma.order.findMany({
            take: limit,
            skip: offset,
            where: {
                userId: user.id,
                itemReview: null,
                state: '배송완료'
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return orders
    }
}))

// Mutation - 리뷰 추천 비추천
export const itemReviewRecommend = mutationField(t => t.field('itemReviewRecommend', {
    type: 'ItemReview',
    args: {
        itemReviewId: nonNull(intArg()),
        recommendState: nonNull(stringArg())
    },
    resolve: async (_, { itemReviewId, recommendState }, ctx) => {
        try {
            await asyncDelay()
            const user = await getIUser(ctx)

            let prevRecommendState = 'none'
            const userLikes = await ctx.prisma.user.findUnique({
                where: { id: user.id },
                include: {
                    itemReviewLikes: {
                        where: { id: itemReviewId }
                    },
                    itemReviewUnlikes: {
                        where: { id: itemReviewId }
                    }
                }
            })
            if (!userLikes) prevRecommendState = 'none'
            else if (userLikes.itemReviewLikes.length !== 0) prevRecommendState = 'liked'
            else if (userLikes.itemReviewUnlikes.length !== 0) prevRecommendState = 'unliked'

            await ctx.prisma.user.update({
                where: { id: user.id },
                data: {
                    itemReviewLikes: {
                        connect: recommendState === 'liked' ? { id: itemReviewId } : undefined,
                        disconnect: prevRecommendState === 'liked' && recommendState !== 'liked' ? { id: itemReviewId } : undefined
                    },
                    itemReviewUnlikes: {
                        connect: recommendState === 'unliked' ? { id: itemReviewId } : undefined,
                        disconnect: prevRecommendState === 'unliked' && recommendState !== 'unliked' ? { id: itemReviewId } : undefined
                    }
                }
            })

            const likeNum = await ctx.prisma.user.count({
                where: {
                    itemReviewLikes: {
                        some: {
                            id: itemReviewId
                        }
                    }
                }
            })
            const itemReview = await ctx.prisma.itemReview.update({
                where: { id: itemReviewId },
                data: {
                    likeNum
                }
            })
            return itemReview
        } catch (error) {
            console.error(error)
            throw error
        }
    }
}))