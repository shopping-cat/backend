import { idArg, intArg, mutationField, nonNull, queryField, stringArg, nullable, list, arg, inputObjectType } from "nexus"
import asyncDelay from "../../utils/asyncDelay"
import getISeller from "../../utils/getISeller"
import { ItemOption, ItemRequireInformation } from "../../types"
import errorFormat from "../../utils/errorFormat"

export const item = queryField(t => t.field('item', {
    type: 'Item',
    args: {
        id: nonNull(intArg())
    },
    resolve: async (_, { id }, ctx) => {
        try {
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
            await asyncDelay()
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

export const createItemInput = inputObjectType({
    name: 'CreateItemInput',
    definition: (t) => {
        t.nonNull.string('name')
        t.nullable.string('category1')
        t.nullable.string('category2')
        t.nonNull.int('price')
        t.nonNull.int('deliveryPrice')
        t.nonNull.int('extraDeliveryPrice')
        t.nullable.field('option', { type: 'Json' })
        t.nonNull.field('requireInformation', { type: 'Json' })
        t.nonNull.list.nonNull.int('images')
        t.nonNull.string('html')
    }
})

// Mutation - 아이템 생성
export const createItem = mutationField(t => t.field('createItem', {
    type: 'Item',
    args: {
        createItemInput: nonNull(createItemInput)
    },
    resolve: async (_, { createItemInput }, ctx) => {

        const { category1, category2, html, name, option, price, images, requireInformation, deliveryPrice, extraDeliveryPrice } = createItemInput

        //option 형식 검사
        if (option) {
            try {
                for (const data of option.data) {
                    if (!('optionGroupName' in data)) throw new Error
                    if (data.optionDetails.length === 0) throw new Error
                    for (const optionDetail of data.optionDetails) {
                        if (!('name' in optionDetail)) throw new Error
                        if (!('price' in optionDetail)) throw new Error
                        price * optionDetail.price
                    }
                }
            } catch (error) {
                throw errorFormat('옵션이 형식에 맞지 않습니다.')
            }
            // 옵션당 0원짜리 있는지 확인
            for (const data of option.data) {
                let price = 1
                for (const optionDetail of data.optionDetails) {
                    price *= optionDetail.price
                }
                if (price !== 0) throw errorFormat('옵션당 0원짜리 옵션 세부는 필수 입니다.')
            }
        }

        // requireInformation 형식 검사
        try {
            if (requireInformation.data.length < 1) throw new Error
            for (const data of requireInformation.data) {
                if (!('title' in data)) throw new Error
                if (!('content' in data)) throw new Error
            }
        } catch (error) {
            throw errorFormat('필수 표기 정보가 형식에 맞지 않습니다.')
        }

        const seller = await getISeller(ctx)

        const item = await ctx.prisma.item.create({
            data: {
                shop: { connect: { id: seller.shopId } },
                state: '상품등록요청',
                name,
                category1,
                category2,
                price,
                html,
                deliveryPrice,
                extraDeliveryPrice,
                option: option as ItemOption,
                requireInformation: requireInformation as ItemRequireInformation,
                images: { connect: images.map((v: number) => ({ id: v })) },
            }
        })
        return item
    }
}))

export const updateItemInput = inputObjectType({
    name: 'UpdateItemInput',
    definition: (t) => {
        t.nonNull.int('id')
        t.nonNull.string('name')
        t.nullable.string('category1')
        t.nullable.string('category2')
        t.nonNull.int('sale')
        t.nonNull.int('price')
        t.nonNull.int('deliveryPrice')
        t.nonNull.int('extraDeliveryPrice')
        t.nullable.field('option', { type: 'Json' })
        t.nonNull.field('requireInformation', { type: 'Json' })
        t.nonNull.list.nonNull.int('images')
        t.nonNull.string('html')
    }
})

// Mutation - 아이템 생성
export const updateItem = mutationField(t => t.field('updateItem', {
    type: 'Item',
    args: {
        updateItemInput: nonNull(updateItemInput)
    },
    resolve: async (_, { updateItemInput }, ctx) => {

        const { id, category1, category2, html, name, option, price, images, requireInformation, deliveryPrice, extraDeliveryPrice, sale } = updateItemInput

        //option 형식 검사
        if (option) {
            try {
                for (const data of option.data) {
                    if (!('optionGroupName' in data)) throw new Error
                    if (data.optionDetails.length === 0) throw new Error
                    for (const optionDetail of data.optionDetails) {
                        if (!('name' in optionDetail)) throw new Error
                        if (!('price' in optionDetail)) throw new Error
                        price * optionDetail.price
                    }
                }
            } catch (error) {
                throw errorFormat('옵션이 형식에 맞지 않습니다.')
            }
            // 옵션당 0원짜리 있는지 확인
            for (const data of option.data) {
                let price = 1
                for (const optionDetail of data.optionDetails) {
                    price *= optionDetail.price
                }
                if (price !== 0) throw errorFormat('옵션당 0원짜리 옵션 세부는 필수 입니다.')
            }
        }

        // requireInformation 형식 검사
        try {
            if (requireInformation.data.length < 1) throw new Error
            for (const data of requireInformation.data) {
                if (!('title' in data)) throw new Error
                if (!('content' in data)) throw new Error
            }
        } catch (error) {
            throw errorFormat('필수 표기 정보가 형식에 맞지 않습니다.')
        }

        const seller = await getISeller(ctx)

        console.log(updateItemInput)

        const item = await ctx.prisma.item.findUnique({
            where: { id },
            include: {
                images: true,
                updateItem: {
                    include: { images: true }
                },
                targetItem: true
            }
        })
        if (!item) throw errorFormat('없는 상품입니다.')
        if (item.shopId !== seller.shopId) throw errorFormat('권한이 없습니다.')
        if (item.targetItem) throw errorFormat('잘못된 접근입니다.')

        if (item.state === '상품등록요청') {
            await ctx.prisma.item.update({
                where: { id },
                data: {
                    shop: { connect: { id: seller.shopId } },
                    name,
                    sale,
                    category1,
                    category2,
                    price,
                    html,
                    deliveryPrice,
                    extraDeliveryPrice,
                    option: option as ItemOption,
                    requireInformation: requireInformation as ItemRequireInformation,
                    images: {
                        disconnect: item.images.map((v) => ({ id: v.id })),
                        connect: images.map((v: number) => ({ id: v }))
                    },
                }
            })
        }
        else if (item.updateItem) {
            await ctx.prisma.item.update({
                where: { id: item.updateItem.id },
                data: {
                    state: '수정할데이터',
                    name,
                    category1,
                    category2,
                    sale,
                    price,
                    html,
                    deliveryPrice,
                    extraDeliveryPrice,
                    option: option as ItemOption,
                    requireInformation: requireInformation as ItemRequireInformation,
                    images: {
                        disconnect: item.updateItem.images.map((v) => ({ id: v.id })),
                        connect: images.map((v: number) => ({ id: v }))
                    },
                }
            })
        }
        else {
            await ctx.prisma.item.update({
                where: { id },
                data: {
                    updateItem: {
                        create: {
                            state: '수정할데이터',
                            name,
                            category1,
                            category2,
                            sale,
                            price,
                            html,
                            deliveryPrice,
                            extraDeliveryPrice,
                            option: option as ItemOption,
                            requireInformation: requireInformation as ItemRequireInformation,
                            images: { connect: images.map((v: number) => ({ id: v })) },
                        }
                    }
                }
            })
        }

        const updatedItem = await ctx.prisma.item.findUnique({
            where: { id },
            include: { images: true }
        })


        return updatedItem
    }
}))

export const updateItemState = mutationField(t => t.field('updateItemState', {
    type: 'Item',
    args: {
        id: nonNull(intArg()),
        state: nonNull(stringArg())
    },
    resolve: async (_, { id, state }, ctx) => {

        const seller = await getISeller(ctx)
        const prevItem = await ctx.prisma.item.findUnique({
            where: { id }
        })
        if (!prevItem) throw errorFormat('존재하지 않는 상품입니다')
        if (prevItem.shopId !== seller.shopId) throw errorFormat('접근 권한이 없습니다')
        if (!(['판매중', '판매중지', '재고없음'].includes(state))) throw errorFormat('형식에 맞지 않습니다')

        const item = await ctx.prisma.item.update({
            where: { id },
            data: { state }
        })
        return item
    }
}))