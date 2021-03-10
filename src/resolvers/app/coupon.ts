import { intArg, mutationField, nonNull, nullable, queryField, stringArg } from "nexus";
import asyncDelay from "../../utils/asyncDelay";
import errorFormat from "../../utils/errorFormat";
import getIUser from "../../utils/getIUser";


// Query - 유저의 유효한 쿠폰 리스트
export const coupons = queryField(t => t.list.field('coupons', {
    type: 'Coupon',
    args: {
        offset: nullable(intArg({ default: 0 })),
        limit: nullable(intArg({ default: 10 }))
    },
    resolve: async (_, { offset, limit }, ctx) => {
        await asyncDelay()

        const user = await getIUser(ctx)

        const coupons = await ctx.prisma.coupon.findMany({
            take: limit,
            skip: offset,
            where: {
                userId: user.id,
                period: { gt: new Date() },
                OR: [
                    { order: { payment: { state: { in: ['결제요청', '결제취소', '취소처리', '오류처리'] } } } },
                    { orderId: null }
                ]
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return coupons
    }
}))

// Mutation - 쿠폰 등록
export const registCoupon = mutationField(t => t.field('registCoupon', {
    type: 'Coupon',
    args: {
        couponId: nonNull(stringArg())
    },
    resolve: async (_, { couponId }, ctx) => {
        await asyncDelay()
        const user = await getIUser(ctx)

        const prevCoupon = await ctx.prisma.coupon.findUnique({
            where: { id: couponId },
        })

        if (!prevCoupon) throw errorFormat('유효하지 않은 쿠폰 번호입니다')
        if (prevCoupon.userId) throw errorFormat('이미 등록된 쿠폰 입니다')

        const coupon = await ctx.prisma.coupon.update({
            where: { id: prevCoupon.id },
            data: { user: { connect: { id: user.id } } }
        })

        return coupon
    }
}))