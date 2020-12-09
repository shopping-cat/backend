/* 
 *
 */
import { idArg, intArg, mutationField, nonNull, queryField, stringArg } from "@nexus/schema"
import { prisma } from "../../context"
import getUser from "../../utils/getUser"

// Query - 내 정보를 가져옴
export const iUser = queryField(t => t.field('iUser', {
    type: 'User',
    resolve: async (_, { }, ctx) => {
        const user = await getUser(ctx)

        return user
    }
}))


export const User = queryField(t => t.field('User', {
    type: 'User',
    args: {
        id: nonNull(stringArg())
    },
    resolve: async (_, { id }, ctx) => {

        return prisma.user.findFirst({ where: { id } })
    }
}))
