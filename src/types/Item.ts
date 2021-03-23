import { objectType } from "nexus"
import getIUser from "../utils/getIUser"
import salePrice from "../utils/salePrice"

export const Item = objectType({
    name: 'Item',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.likeNum()
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
        t.model.images()
        t.model.orders()
        t.model.reviews()
        t.model.cart()
        t.model.userLikes()
        t.model.shop()
        t.model.shopId()
        t.list.field('bestItemReviews', {
            type: 'ItemReview',
            resolve: async ({ id }, _, ctx) => {
                // await ctx.prisma.itemReview.create({
                //     data: {
                //         item: { connect: { id } },
                //         rate: 4,
                //         user: { connect: { id: 'KAKAO:1554573780' } },
                //         order: {
                //             create: {
                //                 address: "address",
                //                 user: { connect: { id: 'KAKAO:1554573780' } },
                //                 item: {
                //                     connect: { id }
                //                 },
                //                 payment: {
                //                     create: {
                //                         cashReceipt: '',
                //                         couponSale: 1,
                //                         itemSale: 1,
                //                         paymentMethod: '',
                //                         pointSale: 1,
                //                         price: 123,
                //                         state: '',
                //                         totalPrice: 123,
                //                         user: { connect: { id: 'KAKAO:1554573780' } }
                //                     }
                //                 },
                //                 phone: '1231',
                //                 pointSale: 123,
                //                 state: ''
                //             }
                //         },
                //         content: '빠른 배송! 조립은 30분 정도 걸린 것 같아요 여자 혼자 가능합니다 원목 상태나 마무리 상태도 너무 좋아요 우리집 텐텐 통통이 너무 좋아합니다! 저희집 천장이 낮아서 캣폴 설치되는 상품이 많이없어서 정말 한참을 찾다가 그린웨일을 알게 되었는데 상담도 잘 해주시고 설치 방법도 잘 설명해주셨어요! 너무 감사합니다!',
                //         images: { create: [{ uri: 'https://gdimg.gmarket.co.kr/674434951/still/600?ver=1575534345' }, { uri: 'https://gdimg.gmarket.co.kr/674434951/still/600?ver=1575534345' }, { uri: 'https://gdimg.gmarket.co.kr/674434951/still/600?ver=1575534345' }, { uri: 'https://gdimg.gmarket.co.kr/674434951/still/600?ver=1575534345' }, { uri: 'https://gdimg.gmarket.co.kr/674434951/still/600?ver=1575534345' }, { uri: 'https://gdimg.gmarket.co.kr/674434951/still/600?ver=1575534345' }, { uri: 'https://gdimg.gmarket.co.kr/674434951/still/600?ver=1575534345' }, { uri: 'https://gdimg.gmarket.co.kr/674434951/still/600?ver=1575534345' }, { uri: 'https://gdimg.gmarket.co.kr/674434951/still/600?ver=1575534345' }, { uri: 'https://gdimg.gmarket.co.kr/674434951/still/600?ver=1575534345' }, { uri: 'https://gdimg.gmarket.co.kr/674434951/still/600?ver=1575534345' }] }
                //     }
                // })
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
                return Number(avg.rate.toFixed(1))
            }
        })
        t.field('isNew', {
            type: 'Boolean',
            resolve: ({ createdAt }) => {
                return (Date.now() - createdAt.getTime()) > 1000 // TODO
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

export type ItemState = 'sale' | 'stop' | 'noStock' | 'requestCreate' | 'requestUpdate'

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