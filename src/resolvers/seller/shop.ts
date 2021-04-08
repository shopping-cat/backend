import { inputObjectType, intArg, mutationField, nonNull, queryField } from "nexus"
import xss from "xss"
import { uploadImage } from "../../lib/googleCloudStorage"
import errorFormat from "../../utils/errorFormat"
import getISeller from "../../utils/getISeller"

export const shop = queryField(t => t.field('shop', {
    type: 'Shop',
    resolve: async (_, { }, ctx) => {
        const seller = await getISeller(ctx)
        const shop = await ctx.prisma.shop.findUnique({
            where: { id: seller.shopId }
        })
        if (!shop) throw errorFormat('상점정보가 없습니다')
        return shop
    }
}))

export const updateShopInput = inputObjectType({
    name: 'UpdateShopInput',
    definition: t => {
        t.nonNull.string('shopName')
        t.nonNull.string('shopImage')
        t.nonNull.string('refundInfo')
        t.nonNull.string('exchangeInfo')
    }
})

export const updateShop = mutationField(t => t.field('updateShop', {
    type: 'Shop',
    args: {
        updateShopInput: nonNull(updateShopInput)
    },
    resolve: async (_, { updateShopInput }, ctx) => {
        const { shopName, shopImage, refundInfo, exchangeInfo } = updateShopInput
        const seller = await getISeller(ctx)
        const shop = await ctx.prisma.shop.update({
            where: { id: seller.shopId },
            data: {
                shopImage,
                shopName,
                refundInfo: xss(refundInfo),
                exchangeInfo: xss(exchangeInfo)
            }
        })
        return shop
    }
}))

export const uploadShopImage = mutationField(t => t.field('uploadShopImage', {
    type: 'String',
    args: {
        image: nonNull('Upload')
    },
    resolve: async (_, { image }, ctx) => {
        await getISeller(ctx)
        const uri = await uploadImage(image, 'shop-image/')
        return uri
    }
}))