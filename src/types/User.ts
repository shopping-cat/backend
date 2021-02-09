import { objectType } from "nexus"
import { userAuth } from "../lib"

export const User = objectType({
    name: 'User',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.point()
        t.model.coupons()
        t.model.name()
        t.model.photo()
        t.model.orders()
        t.model.payments()
        t.model.refundBankAccount()
        t.model.deliveryInfo()
        t.model.itemReviews()
        t.model.itemReviewLikes()
        t.model.itemReviewUnlikes()
        t.model.itemLikes()
        t.model.cart()
        t.model.searchKeywords()
        t.list.field('recentSearchKeywords', {
            type: 'SearchKeyword',
            resolve: async ({ id }, _, ctx) => {
                const searchKeywords = await ctx.prisma.searchKeyword.findMany({
                    where: { userId: id },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 20
                })
                return searchKeywords
            }
        })
        t.nonNull.field('couponNum', {
            type: 'Int',
            resolve: async ({ id }, _, ctx) => {
                const coupon = await ctx.prisma.coupon.aggregate({
                    count: true,
                    where: {
                        userId: id,
                        period: { gt: new Date() },
                        orderId: null
                    },
                })
                return coupon.count
            }
        })
        // oauth에 있는 유저 정보들 가져오기
        t.field('userDetail', {
            type: 'UserDetail',
            resolve: async ({ id, phone }) => {
                try {
                    const { email, displayName, photoURL } = await userAuth.getUser(id)
                    return {
                        email: email || null,
                        displayName: displayName || null,
                        photoURL: photoURL || null,
                        phone: phone || null
                    }
                } catch (error) {
                    console.log(error)
                    // 오류시 속성마다 null 로 리턴
                    return {
                        email: null,
                        displayName: null,
                        photoURL: null,
                        phone: null
                    }
                }
            }
        })
    }
})

// oauth에 있는 유저 정보
export const UserDetail = objectType({
    name: 'UserDetail',
    definition(t) {
        t.nullable.string('email') // 이메일
        t.nullable.string('displayName') // 이름
        t.nullable.string('photoURL') // 프로필 사진
        t.nullable.string('phone') // 전화번호
    }
})