import { CartItem } from "@prisma/client"
import { intArg, mutationField, nonNull, nullable, queryField, stringArg } from "nexus"
import { prisma } from "../../context"
import { ItemOption } from "../../types"
import asyncDelay from "../../utils/asyncDelay"
import getIUser from "../../utils/getIUser"

export const cartItems = queryField(t => t.list.field('cartItems', {
    type: 'CartItem',
    resolve: async (_, { }, ctx) => {
        await asyncDelay()
        const user = await getIUser(ctx)
        return ctx.prisma.cartItem.findMany({
            where: { userId: user.id }
        })
    }
}))

// Mutation - 카트에 담기
export const addToCart = mutationField(t => t.list.field('addToCart', {
    type: 'CartItem',
    args: {
        itemId: nonNull(intArg()),
        number: nonNull(intArg()),
        option: nullable(stringArg())
    },
    resolve: async (_, { itemId, number, option: stringifiedOption }, ctx) => {
        try {
            await asyncDelay()
            // 유저 식별
            const user = await getIUser(ctx)

            // 상품 유효 확인
            const item = await ctx.prisma.item.findUnique({ where: { id: itemId } })
            if (!item) throw new Error('없는 상품입니다')

            // option 유효 확인
            const option: number[] = JSON.parse(stringifiedOption)
            const itemOption = item.option as ItemOption
            if (itemOption === null && !!stringifiedOption) throw new Error('옵션 선택이 잘못되었습니다')
            if (itemOption !== null && stringifiedOption !== null) {
                if (option.length !== itemOption.data.length) throw new Error('옵션 선택이 잘못되었습니다')
                for (let i = 0; i < option.length; i++) {
                    if (option[i] >= itemOption.data[i].optionDetails.length) throw new Error('옵션 선택이 잘못되었습니다')
                }
            }
            // 수량만큼 cartItem생성
            const cartItems: CartItem[] = []
            for (let i = 0; i < number; i++) {
                const cartItem = await prisma.cartItem.create({
                    data: {
                        item: { connect: { id: itemId } },
                        user: { connect: { id: user.id } },
                        option: option ? { data: option } : null
                    },
                })
                cartItems.push(cartItem)
            }
            return cartItems
        } catch (error) {
            throw error
        }
    }
}))
