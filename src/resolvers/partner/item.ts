import { idArg, intArg, mutationField, nonNull, queryField, stringArg, nullable } from "nexus"
import getIUser from "../../utils/getIUser"

// Mutation - 아이템 생성
export const createItem = mutationField(t => t.field('createItem', {
    type: 'Item',
    args: {
        category: nonNull(stringArg()),
        html: nonNull(stringArg()),
        name: nonNull(stringArg()),
        option: nonNull(stringArg()),
        price: nonNull(intArg())
    },
    resolve: async (_, { category, html, name, option, price }, ctx) => {
        const item = await ctx.prisma.item.create({
            data: {
                category,
                html,
                name,
                option: { "data": [{ "optionDetails": [{ "name": "빨간색", "price": 0 }, { "name": "주황색", "price": 0 }, { "name": "노란색", "price": 0 }, { "name": "초록색", "price": 0 }, { "name": "파란색", "price": 0 }, { "name": "남색", "price": -20000 }, { "name": "보라색", "price": 2300 }], "optionGroupName": "색상" }, { "optionDetails": [{ "name": "S", "price": -300 }, { "name": "M", "price": 0 }, { "name": "L", "price": 20000 }, { "name": "XL", "price": 50000 }], "optionGroupName": "사이즈" }] },
                price,
                partner: { connect: { id: 1 } },
                deliveryPrice: 2500,
                extraDeliveryPrice: 2500,
                requireInformation: { "data": [] },
                images: { create: { uri: "https://img.catpre.com/mobile/catpre/product/38/37549_originalView_01754973.jpg" } }
            }
        })
        return item
    }
}))