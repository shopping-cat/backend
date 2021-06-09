import { inputObjectType, intArg, mutationField, nonNull, queryField } from "nexus";
import { sellerAuth } from "../../lib/firebase";
import errorFormat from "../../utils/errorFormat";
import objectNullToUndefind from "../../utils/objectNullToUndefind";

export const shops = queryField(t => t.list.field('shops', {
    type: 'Shop',
    resolve: (_, { }, ctx) => {
        return ctx.prisma.shop.findMany()
    }
}))

export const updateShop = mutationField(t => t.field('updateShop', {
    type: 'Shop',
    args: {
        id: nonNull(intArg()),
        input: nonNull(inputObjectType({
            name: 'UpdateShopInput',
            definition: (t) => {
                t.nullable.string('state')
            }
        }))
    },
    resolve: async (_, { id, input }, ctx) => {
        const shops = await ctx.prisma.shop.update({
            where: { id },
            data: objectNullToUndefind(input)
        })
        return shops
    }
}))


export const shop = queryField(t => t.field('shop', {
    type: 'Shop',
    args: {
        id: nonNull(intArg())
    },
    resolve: async (_, { id }, ctx) => {
        const shop = await ctx.prisma.shop.findUnique({ where: { id } })
        if (!shop) throw errorFormat('상점정보가 없습니다')
        return shop
    }
}))


export const createRequestShops = queryField(t => t.list.field('createRequestShops', {
    type: 'Shop',
    resolve: async (_, { }, ctx) => {
        const shops = await ctx.prisma.shop.findMany({
            where: {
                state: '가입요청'
            }
        })
        return shops
    }
}))

export const approveCreateRequestShop = mutationField(t => t.field('approveCreateRequestShop', {
    type: 'Shop',
    args: {
        id: nonNull(intArg())
    },
    resolve: async (_, { id }, ctx) => {
        const shop = await ctx.prisma.shop.findUnique({
            where: { id },
            include: {
                seller: true
            }
        })
        if (!shop) throw errorFormat('상점이 없습니다')
        if (!shop.state) throw errorFormat(`${shop.state} 상태에서는 가입 허용 할 수 없습니다`)
        if (!shop.seller) throw errorFormat('셀러가 없습니다')

        await sellerAuth.createUser({
            email: shop.seller.email,
            password: '123456'
        })
        // TODO send success email

        const updatedShop = await ctx.prisma.shop.update({
            where: { id },
            data: {
                state: '정상'
            }
        })

        return updatedShop
    }
}))

export const rejectCreateRequestShop = mutationField(t => t.field('rejectCreateRequestShop', {
    type: 'Shop',
    args: {
        id: nonNull(intArg())
    },
    resolve: async (_, { id }, ctx) => {
        const shop = await ctx.prisma.shop.findUnique({
            where: { id },
            include: {
                seller: true
            }
        })

        if (!shop) throw errorFormat('상점이 없습니다')
        if (!shop.state) throw errorFormat(`${shop.state} 상태에서는 가입 허용 할 수 없습니다`)
        if (!shop.seller) throw errorFormat('셀러가 없습니다')


        await ctx.prisma.seller.delete({
            where: { id: shop.seller.id }
        })
        const deletedShop = await ctx.prisma.shop.delete({
            where: { id }
        })

        // TODO send reject email

        return deletedShop
    }
}))