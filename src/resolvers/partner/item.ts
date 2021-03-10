import { idArg, intArg, mutationField, nonNull, queryField, stringArg, nullable, list } from "nexus"
import getIUser from "../../utils/getIUser"

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
                partner: { connect: { id: 1 } },
                deliveryPrice: 2500,
                extraDeliveryPrice: 2500,
                requireInformation: { "data": [] },
                images: { create: images.map((v: string) => ({ uri: v })) }
            }
        })
        return item
    }
}))