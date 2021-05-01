import { intArg, nullable, objectType, stringArg } from "nexus"
import errorFormat from "../utils/errorFormat"
import { COMMISSION } from "../values"

export const Shop = objectType({
    name: 'Shop',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.shopName()
        t.model.shopImage()
        t.model.exchangeInfo()
        t.model.refundInfo()
        t.model.items()
        t.model.seller()
        t.model.profitReceipts()
        t.model.kakaoId()
        t.model.bankAccountNumber()
        t.model.bankName()
        t.model.bankOwnerName()
        t.model.kakaoLink()
        t.model.csPhone()
        t.field('balance', {
            type: 'Int',
            resolve: async ({ id }, { }, ctx) => {
                const { sum } = await ctx.prisma.order.aggregate({
                    sum: { totalPrice: true },
                    where: {
                        item: { shopId: id },
                        state: '구매확정',
                        profitReceipt: null
                    }
                })
                if (sum.totalPrice === null) return 0
                return Number((sum.totalPrice * (100 - COMMISSION) / 100).toFixed(0))
            }
        })
        t.field('rate', {
            type: 'Float',
            resolve: async ({ id }, _, ctx) => {
                const { avg } = await ctx.prisma.itemReview.aggregate({
                    avg: { rate: true },
                    where: { item: { shopId: id } }
                })
                return Number((avg.rate || 0).toFixed(1))
            }
        })
        t.field('rateNum', {
            type: 'Int',
            resolve: async ({ id }, _, ctx) => {
                return ctx.prisma.itemReview.count({ where: { item: { shopId: id } } })
            }
        })
        t.field('itemNum', {
            type: 'Int',
            resolve: async ({ id }, _, ctx) => {
                return ctx.prisma.item.count({ where: { shopId: id } })
            }
        })
        t.field('newOrderNum', {
            type: 'Int',
            resolve: ({ id }, _, ctx) => {
                return ctx.prisma.order.count({
                    where: {
                        item: { shopId: id },
                        state: '구매접수',
                        payment: { state: '정상처리' }
                    }
                })
            }
        })
        t.field('onDeliveryOrderNum', {
            type: 'Int',
            resolve: ({ id }, _, ctx) => {
                return ctx.prisma.order.count({
                    where: {
                        item: { shopId: id },
                        state: '배송중',
                        payment: { state: '정상처리' }
                    }
                })
            }
        })
        t.field('completedDeliveryOrderNum', {
            type: 'Int',
            resolve: ({ id }, _, ctx) => {
                return ctx.prisma.order.count({
                    where: {
                        item: { shopId: id },
                        state: '배송완료',
                        payment: { state: '정상처리' }
                    }
                })
            }
        })
        t.field('confirmedOrderNum', {
            type: 'Int',
            resolve: ({ id }, _, ctx) => {
                return ctx.prisma.order.count({
                    where: {
                        item: { shopId: id },
                        state: '구매확정',
                        payment: { state: '정상처리' }
                    }
                })
            }
        })
        t.field('refundRequestOrderNum', {
            type: 'Int',
            resolve: ({ id }, _, ctx) => {
                return ctx.prisma.order.count({
                    where: {
                        item: { shopId: id },
                        state: '환불중',
                        payment: { state: '정상처리' }
                    }
                })
            }
        })
        t.field('exchangeRequestOrderNum', {
            type: 'Int',
            resolve: ({ id }, _, ctx) => {
                return ctx.prisma.order.count({
                    where: {
                        item: { shopId: id },
                        state: '교환중',
                        payment: { state: '정상처리' }
                    }
                })
            }
        })
        t.field('refundedOrderNum', {
            type: 'Int',
            resolve: ({ id }, _, ctx) => {
                return ctx.prisma.order.count({
                    where: {
                        item: { shopId: id },
                        state: '환불처리',
                        payment: { state: '정상처리' }
                    }
                })
            }
        })
        t.field('exchangedOrderNum', {
            type: 'Int',
            resolve: ({ id }, _, ctx) => {
                return ctx.prisma.order.count({
                    where: {
                        item: { shopId: id },
                        state: '교환처리',
                        payment: { state: '정상처리' }
                    }
                })
            }
        })
    }
})