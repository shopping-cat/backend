/* 
 *
 */
import { idArg, intArg, mutationField, nonNull, queryField, stringArg } from "@nexus/schema"

// 
export const IUser = queryField(t => t.field('user', {
    type: 'User',
    args: {
        id: nonNull(intArg()),
    },
    resolve: (_, { id }, ctx) => {
        return ctx.prisma.user.findUnique({
            where: { id }
        })
    }
}))