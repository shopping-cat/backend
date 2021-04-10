import { arg, booleanArg, intArg, list, mutationField, nonNull, nullable, queryField, stringArg } from "nexus"
import { prisma } from "../../context"
import { ItemOption } from "../../types"
import errorFormat from "../../utils/errorFormat"
import getIUser from "../../utils/getIUser"

export const cartItems = queryField(t => t.list.field('cartItems', {
    type: 'CartItem',
    resolve: async (_, { }, ctx) => {
        const user = await getIUser(ctx)
        return ctx.prisma.cartItem.findMany({
            where: { userId: user.id },
            orderBy: {
                createdAt: 'desc'
            }
        })
    }
}))

// Mutation - 카트에 담기
export const addToCart = mutationField(t => t.field('addToCart', {
    type: 'CartItem',
    args: {
        itemId: nonNull(intArg()),
        number: nonNull(intArg()),
        option: nullable(list(intArg())),
        isDirectBuy: nullable(booleanArg({ default: false })) // 바로구매 버튼을 눌렀는지
    },
    resolve: async (_, { itemId, number, option, isDirectBuy }, ctx) => {
        try {
            // 유저 식별
            const user = await getIUser(ctx)

            // 상품 유효 확인
            const item = await ctx.prisma.item.findUnique({ where: { id: itemId } })
            if (!item) throw errorFormat('없는 상품입니다')

            // option 유효 확인
            const itemOption = item.option as ItemOption
            if ((!itemOption && option) || (itemOption && !option)) throw errorFormat('옵션 선택이 잘못되었습니다')
            if (itemOption && option) {
                if (option.length !== itemOption.data.length) throw errorFormat('옵션 선택이 잘못되었습니다')
                for (let i = 0; i < option.length; i++) {
                    if (option[i] >= itemOption.data[i].optionDetails.length) throw errorFormat('옵션 선택이 잘못되었습니다')
                }
            }
            const jsonOption = option ? { data: option } : null // json type으로 전환

            // 이미 같은 옵션의 똑 같은 상품이 있다면 새로 만들지 말고 number만큼 추가만 함
            const cartItem = await prisma.cartItem.findFirst({
                where: {
                    itemId,
                    userId: user.id,
                    option: { equals: jsonOption }
                }
            })
            if (cartItem) {
                return prisma.cartItem.update({
                    where: { id: cartItem.id },
                    data: { num: isDirectBuy ? number : cartItem.num + number }
                })
            } else { // 없으면 생성
                return prisma.cartItem.create({
                    data: {
                        item: { connect: { id: itemId } },
                        user: { connect: { id: user.id } },
                        option: jsonOption,
                        num: number,
                    }
                })
            }
        } catch (error) {
            throw error
        }
    }
}))
// MUTATION - 카트에서 삭제
export const deleteCartItems = mutationField(t => t.field('deleteCartItems', {
    type: 'Int',
    args: {
        itemIds: nonNull(list(intArg()))
    },
    resolve: async (_, { itemIds }, ctx) => {
        const user = await getIUser(ctx)
        const { count } = await ctx.prisma.cartItem.deleteMany({
            where: {
                userId: user.id,
                id: { in: itemIds }
            }
        })
        return count
    }
}))