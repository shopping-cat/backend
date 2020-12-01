/* 
 *
 */
import { idArg, mutationField, nonNull, queryField, stringArg } from "@nexus/schema"

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

export const updateUser = mutationField(t => t.field('updateUser', {
    type: 'User',
    args: {
        id: nonNull(idArg()),
        email: nonNull(stringArg())
    },
    resolve: (_, { email, id }, ctx) => {
        return ctx.prisma.user.update({
            where: { id },
            data: { email }
        })
    }
}))