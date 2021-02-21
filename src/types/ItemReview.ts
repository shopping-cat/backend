import { objectType } from "nexus"
import getIUser from "../utils/getIUser"

export const ItemReview = objectType({
    name: 'ItemReview',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.likeNum()
        t.model.content()
        t.model.rate()
        t.model.userLikes()
        t.model.userUnlikes()
        t.model.images()
        t.model.user()
        t.model.item()
        t.model.order()
        t.model.userId()
        t.model.itemId()
        t.model.orderId()
        t.list.field('imageUrls', {
            type: 'String',
            resolve: async ({ id }, _, ctx) => {
                const itemReview = await ctx.prisma.itemReview.findUnique({
                    where: { id },
                    include: { images: true }
                })
                if (!itemReview) return []
                return itemReview.images.map(v => v.uri)
            }
        })
        t.field('recommendState', { // 해당 유저가 좋아요 누른 상품인지
            type: 'String',
            resolve: async ({ id }, _, ctx) => {
                const user = await getIUser(ctx)
                const userLikes = await ctx.prisma.user.findUnique({
                    where: { id: user.id },
                    include: {
                        itemReviewLikes: {
                            where: { id }
                        },
                        itemReviewUnlikes: {
                            where: { id }
                        }
                    }
                })
                if (!userLikes) return 'none'
                if (userLikes.itemReviewLikes.length !== 0) return 'liked'
                if (userLikes.itemReviewUnlikes.length !== 0) return 'unliked'
                return 'none'
            }
        })
    }
})
