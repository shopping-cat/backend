import { objectType } from 'nexus'
import errorFormat from '../utils/errorFormat'
import salePrice from '../utils/salePrice'
import { ItemOption } from './Item'


export const CartItem = objectType({
    name: 'CartItem',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.option()
        t.model.user()
        t.model.item()
        t.model.userId()
        t.model.itemId()
        t.model.num()
        t.int('optionedSaledPrice', {  // 세일 + 옵션 적용 가격
            resolve: async ({ num, option, itemId }, _, ctx) => {
                const item = await ctx.prisma.item.findUnique({ where: { id: itemId } })
                if (!item) throw errorFormat('존재하지 않는 아이템 입니다')
                const itemOption = item.option as ItemOption
                const cartItemOption = option as CartItemOption
                let optionedPrice = salePrice(item.sale, item.price)
                if (!itemOption || !cartItemOption) return optionedPrice
                for (const i in itemOption.data) {
                    optionedPrice += itemOption.data[i].optionDetails[cartItemOption.data[i]].price
                }
                return optionedPrice
            }
        })
        t.int('optionedPrice', { // 옵션 적용 가격
            resolve: async ({ num, option, itemId }, _, ctx) => {
                const item = await ctx.prisma.item.findUnique({ where: { id: itemId } })
                if (!item) throw errorFormat('존재하지 않는 아이템 입니다')
                const itemOption = item.option as ItemOption
                const cartItemOption = option as CartItemOption
                let optionedPrice = item.price
                if (!itemOption || !cartItemOption) return optionedPrice
                for (const i in itemOption.data) {
                    optionedPrice += itemOption.data[i].optionDetails[cartItemOption.data[i]].price
                }
                return optionedPrice
            }
        })
        t.nullable.field('stringOption', {
            type: 'String',
            async resolve({ option, itemId }, _, { prisma }) {
                const item = await prisma.item.findUnique({
                    where: { id: itemId }
                })
                if (!item) return null
                const itemOption = item.option as ItemOption
                const cartItemOption = option as CartItemOption
                if (!itemOption) return null
                if (!cartItemOption) return null
                return itemOption.data.map((v, i) => `${i !== 0 ? ' | ' : ''}${v.optionDetails[cartItemOption.data[i]].name}`).join('')
            }
        })
    }
})

export type CartItemOption = {
    data: number[]
} | null