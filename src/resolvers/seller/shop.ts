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

export const createShopInput = inputObjectType({
    name: 'CreateShopInput',
    definition: t => {
        t.nonNull.string('email')
        t.nonNull.string('licenseNumber')
        t.nonNull.string('bizType')
        t.nonNull.string('bizRegistration')

        t.nonNull.string('shopName')
        t.nonNull.string('kakaoId')

        t.nonNull.string('bankAccountNumber')
        t.nonNull.string('bankName')
        t.nonNull.string('bankOwnerName')

        t.nullable.string('kakaoLink')
        t.nullable.string('csPhone')

        t.nonNull.string('managerName')
        t.nonNull.string('managerPhone')
        t.nonNull.string('managerEmail')

        t.nullable.string('storeLink')
    }
})

export const createShop = mutationField(t => t.field('createShop', {
    type: 'Shop',
    args: {
        createShopInput: nonNull(createShopInput)
    },
    resolve: async (_, { createShopInput }, ctx) => {
        console.log(createShopInput)
        const shop = await ctx.prisma.shop.create({
            data: {
                shopName: createShopInput.shopName,
                kakaoId: createShopInput.kakaoId,
                bankAccountNumber: createShopInput.bankAccountNumber,
                bankName: createShopInput.bankName,
                bankOwnerName: createShopInput.bankOwnerName,
                kakaoLink: createShopInput.kakaoLink,
                csPhone: createShopInput.csPhone,
                managerName: createShopInput.managerName,
                managerPhone: createShopInput.managerPhone,
                managerEmail: createShopInput.managerEmail,
                storeLink: createShopInput.storeLink,
                seller: {
                    create: {
                        email: createShopInput.email,
                        licenseNumber: createShopInput.licenseNumber,
                        bizRegistration: createShopInput.bizRegistration,
                        bizType: createShopInput.bizType
                    }
                }
            }
        })
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
        t.nullable.string('kakaoId')
        t.nullable.string('kakaoLink')
        t.nullable.string('csPhone')
        t.nullable.string('bankAccountNumber')
        t.nullable.string('bankName')
        t.nullable.string('bankOwnerName')

    }
})

export const updateShop = mutationField(t => t.field('updateShop', {
    type: 'Shop',
    args: {
        updateShopInput: nonNull(updateShopInput)
    },
    resolve: async (_, { updateShopInput }, ctx) => {
        const { refundInfo, exchangeInfo } = updateShopInput
        const seller = await getISeller(ctx)
        const shop = await ctx.prisma.shop.update({
            where: { id: seller.shopId },
            data: {
                ...updateShopInput,
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

export const uploadEtcImage = mutationField(t => t.field('uploadEtcImage', {
    type: 'String',
    args: {
        image: nonNull('Upload')
    },
    resolve: async (_, { image }, ctx) => {
        const uri = await uploadImage(image, 'etc-image/')
        return uri
    }
}))