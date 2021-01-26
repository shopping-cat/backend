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

export const createUser = mutationField(t => t.field('deleteUser', {
    type: 'User',
    args: {
        id: nonNull(idArg())
    },
    resolve: (_, { id }, ctx) => {
        return ctx.prisma.user.delete({
            where: { id }
        })
    }
}))