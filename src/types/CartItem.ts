import { objectType } from 'nexus'
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