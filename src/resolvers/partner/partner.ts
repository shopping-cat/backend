/* 
 *
 */
import { idArg, mutationField, nonNull, queryField, stringArg } from "nexus"

// 
export const user = queryField(t => t.field('user', {
    type: 'User',
    args: {
        id: nonNull(idArg()),
    },
    resolve: (_, { id }, ctx) => {
        return ctx.prisma.user.findUnique({
            where: { id }
        })
    }
}))

export const createUser = mutationField(t => t.field('createUser', {
    type: 'Partner',
    args: {
    },
    resolve: (_, { }, ctx) => {
        return ctx.prisma.partner.create({
            data: {
                email: '123@gmail.com',
                licenseNumber: '1292041-2124',
                shopImage: '',
                shopName: 'shop1'
            }
        })
    }
}))