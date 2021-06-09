import dayjs from "dayjs"
import { objectType } from "nexus"
import getIUser from "../utils/getIUser"
import salePrice from "../utils/salePrice"
import { ITEM_NEW_DAYS } from "../values"

export const Item = objectType({
    name: 'Item',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.likeNum()
        t.model.type()
        t.model.state()
        t.model.deliveryPrice()
        t.model.extraDeliveryPrice()
        t.model.name()
        t.model.price()
        t.model.sale()
        t.model.option()
        t.model.requireInformation()
        t.model.html()
        t.model.category1()
        t.model.category2()
        t.model.targetItemId()
        t.model.targetItem()
        t.model.updateItem()
        t.model.images()
        t.model.orders()
        t.model.reviews()
        t.model.cart()
        t.model.userRecentViewItem()
        t.model.userLikes()
        t.model.shop()
        t.model.shopId()
        t.list.field('bestItemReviews', {
            type: 'ItemReview',
            resolve: async ({ id }, _, ctx) => {
                return ctx.prisma.itemReview.findMany({
                    take: 5,
                    orderBy: { likeNum: 'desc' },
                    where: { itemId: id }
                })
            }
        })
        t.field('isFreeDelivery', {
            type: 'Boolean',
            resolve: async ({ deliveryPrice }, _, ctx) => {
                return deliveryPrice === 0
            }
        })
        t.field('reviewNum', {
            type: 'Int',
            resolve: async ({ id }, _, ctx) => {
                const reviewNum = await ctx.prisma.itemReview.count({ where: { itemId: id } })
                return reviewNum
            }
        })
        t.list.field('imageUrls', {
            type: 'String',
            resolve: async ({ id }, _, ctx) => {
                const item = await ctx.prisma.item.findUnique({
                    where: { id },
                    include: { images: true }
                })
                if (!item) return []
                return item.images.map(v => v.uri)
            }
        })
        t.field('salePrice', {// 세일이 적용된 실제 판매 금액
            type: 'Int',
            resolve: ({ sale, price }) => {
                return salePrice(sale, price)
            }
        })
        t.field('isILiked', { // 해당 유저가 좋아요 누른 상품인지
            type: 'Boolean',
            resolve: async ({ id }, _, ctx) => {
                try {
                    const user = await getIUser(ctx)
                    const userLikes = await ctx.prisma.user.findUnique({
                        where: { id: user.id },
                        include: {
                            itemLikes: {
                                where: { id }
                            }
                        }
                    })
                    if (!userLikes) return false
                    if (userLikes.itemLikes.length === 0) return false
                    return true
                } catch (error) {
                    return false
                }
            }
        })
        t.field('mainImage', {
            type: 'String',
            resolve: async ({ id }, _, ctx) => {
                const itemImage = await ctx.prisma.itemImage.findFirst({
                    where: { itemId: id }
                })
                if (!itemImage) return 'https://static.toiimg.com/thumb/msid-67586673,width-800,height-600,resizemode-75,imgsize-3918697,pt-32,y_pad-40/67586673.jpg'
                return itemImage.uri
            }
        })
        t.field('rate', {
            type: 'Float',
            resolve: async ({ id }, _, ctx) => {
                const { avg } = await ctx.prisma.itemReview.aggregate({
                    avg: { rate: true },
                    where: { itemId: id }
                })
                if (!avg.rate) return 0
                return Number(avg.rate.toFixed(1))
            }
        })
        t.field('isNew', {
            type: 'Boolean',
            resolve: ({ createdAt }) => {
                return dayjs().add(-ITEM_NEW_DAYS, 'day').toDate().getTime() < createdAt.getTime()
            }
        })
        t.field('totalOrderNum', {
            type: 'Int',
            resolve: async ({ id }, { }, ctx) => {
                const count = await ctx.prisma.order.count({
                    where: {
                        itemId: id,
                        state: '구매확정'
                    }
                })

                return count
            }
        })
    }
})

export type ItemState =
    '판매중' |
    '판매중지' |
    '판매정지' |
    '재고없음' |
    '상품등록요청'

export type ItemOption = {
    data: {
        optionGroupName: string
        optionDetails: {
            name: string
            price: number
        }[]
    }[]
} | null


export type ItemRequireInformation = {
    data: {
        title: string
        content: string
    }[]
} | null