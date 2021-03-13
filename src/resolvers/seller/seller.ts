/* 
 *
 */
import { idArg, mutationField, nonNull, queryField, stringArg } from "nexus"


export const createSeller = mutationField(t => t.field('createSeller', {
    type: 'Seller',
    args: {
    },
    resolve: (_, { }, ctx) => {
        return ctx.prisma.seller.create({
            data: {
                email: '123@gmail.com',
                licenseNumber: '1292041-2124',
                shop: {
                    create: {
                        shopImage: 'https://storage.googleapis.com/shoppingcat/item-image/shutterstock_1858507978.jpg',
                        shopName: '수제냥이'
                    }
                }
            }
        })
    }
}))