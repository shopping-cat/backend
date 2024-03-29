import dayjs from "dayjs";
import { intArg, mutationField, nonNull, nullable, stringArg } from "nexus";
import createNotification from "../../utils/createNotification";
import errorFormat from "../../utils/errorFormat";

const cc = require('coupon-code');


const createCoupon = mutationField(t => t.field('createCoupon', {
    type: 'Coupon',
    args: {
        image: nonNull(stringArg()),
        name: nonNull(stringArg()),
        userId: nullable(stringArg()),
        period: nonNull(stringArg()), // YYYYMMDD
        salePrice: nullable(intArg()),
        salePercent: nullable(intArg()),
        minItemPrice: nullable(intArg()), // 최소 상품 금액 (salePrice, salePercent)
        maxSalePrice: nullable(intArg()) // 최대 할인 금액 (salePercent)
    },
    resolve: async (_, { image, name, userId, period, minItemPrice, salePrice, maxSalePrice, salePercent }, ctx) => {

        if (!salePrice && !salePercent) throw errorFormat('salePrice와 salePercent 둘 중에 하나는 있어야합니다')
        if (salePercent && !maxSalePrice) throw errorFormat('salePercent는 maxSalePrice를 필요로 합니다')
        if (salePrice && maxSalePrice) throw errorFormat('salePrice는 maxSalePrice와 같이 사용할 수 없습니다')

        const couponId = cc.generate()

        if (userId) {
            await createNotification({
                title: '테스트',
                content: '쿠폰 발급',
                type: 'none',
                user: { connect: { id: userId } }
            }, userId)
        }

        return ctx.prisma.coupon.create({
            data: {
                id: couponId,
                image,
                name,
                user: userId ? { connect: { id: userId } } : undefined,
                period: dayjs(period + '235959', 'YYYYMMDDHHmmss').toDate(), // 해당 날짜의 마지막 시간
                salePercent,
                salePrice,
                minItemPrice,
                maxSalePrice,
            }
        })

    }
}))