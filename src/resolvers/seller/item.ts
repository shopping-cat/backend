import { idArg, intArg, mutationField, nonNull, queryField, stringArg, nullable, list } from "nexus"
import getISeller from "../../utils/getISeller"

export const item = queryField(t => t.field('item', {
    type: 'Item',
    args: {
        id: nonNull(intArg())
    },
    resolve: async (_, { id }, ctx) => {
        try {
            const seller = await getISeller(ctx)
            const item = await ctx.prisma.item.findUnique({
                where: { id }
            })
            return item
        } catch (error) {
            console.error(error)
            throw error
        }
    }
}))

export const items = queryField(t => t.list.field('items', {
    type: 'Item',
    resolve: async (_, { }, ctx) => {
        try {
            const seller = await getISeller(ctx)
            const item = await ctx.prisma.item.findMany({
                where: { shopId: seller.shopId },
                orderBy: {
                    createdAt: 'desc'
                }
            })
            return item
        } catch (error) {
            console.error(error)
            throw error
        }
    }
}))

// Mutation - 아이템 생성
export const createItem = mutationField(t => t.field('createItem', {
    type: 'Item',
    args: {
        category: nonNull(stringArg()),
        html: nonNull(stringArg()),
        name: nonNull(stringArg()),
        option: nonNull(stringArg()),
        price: nonNull(intArg()),
        images: nonNull(list(stringArg()))
    },
    resolve: async (_, { category, html, name, option, price, images }, ctx) => {
        const item = await ctx.prisma.item.create({
            data: {
                category,
                html,
                name,
                option: { "data": [{ "optionDetails": [{ "name": "회색", "price": 0 }, { "name": "베이지색", "price": 0 }], "optionGroupName": "색상" }, { "optionDetails": [{ "name": "소형", "price": 0 }, { "name": "중형", "price": 15000 }, { "name": "대형", "price": 25000 }], "optionGroupName": "사이즈" }] },
                price,
                shop: { connect: { id: 1 } },
                deliveryPrice: 2500,
                extraDeliveryPrice: 2500,
                requireInformation: { "data": [] },
                images: { create: images.map((v: string) => ({ uri: v })) }
            }
        })
        return item
    }
}))