import { idArg, intArg, mutationField, nonNull, queryField, stringArg, nullable, list, arg, inputObjectType } from "nexus"
import errorFormat from "../../utils/errorFormat"


export const item = queryField(t => t.field('item', {
    type: 'Item',
    args: {
        id: nonNull(intArg())
    },
    resolve: async (_, { id }, ctx) => {
        const item = await ctx.prisma.item.findUnique({
            where: { id }
        })
        return item
    }
}))

export const registRequestItems = queryField(t => t.list.field('registRequestItems', {
    type: 'Item',
    resolve: async (_, { }, ctx) => {
        return ctx.prisma.item.findMany({
            where: {
                state: '상품등록요청'
            }
        })
    }
}))

export const updateRequestItems = queryField(t => t.list.field('updateRequestItems', {
    type: 'Item',
    resolve: async (_, { }, ctx) => {
        return ctx.prisma.item.findMany({
            where: {
                NOT: {
                    updateItem: null
                }
            }
        })
    }
}))

export const approveRegistRequestItem = mutationField(t => t.field('approveRegistRequestItem', {
    type: 'Item',
    args: {
        id: nonNull(intArg())
    },
    resolve: async (_, { id }, ctx) => {
        const prevItem = await ctx.prisma.item.findUnique({ where: { id } })
        if (!prevItem) throw errorFormat('없는 상품입니다')
        if (prevItem.state !== '상품등록요청') throw errorFormat(`${prevItem.state} 상태에서는 불가능합니다`)
        return ctx.prisma.item.update({
            where: { id },
            data: {
                state: '판매중'
            }
        })
    }
}))

export const rejectRegistRequestItem = mutationField(t => t.field('rejectRegistRequestItem', {
    type: 'Item',
    args: {
        id: nonNull(intArg())
    },
    resolve: async (_, { id }, ctx) => {
        const prevItem = await ctx.prisma.item.findUnique({ where: { id } })
        if (!prevItem) throw errorFormat('없는 상품입니다')
        if (prevItem.state !== '상품등록요청') throw errorFormat(`${prevItem.state} 상태에서는 불가능합니다`)
        return ctx.prisma.item.delete({
            where: { id }
        })
    }
}))