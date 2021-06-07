/* 
 *
 */
import { idArg, intArg, mutationField, nonNull, queryField, stringArg } from "nexus"
import addPoint from "../../utils/addPoint"

const addUserPoint = mutationField('addUserPoint', {
    type: 'User',
    args: {
        point: nonNull(intArg()),
        name: nonNull(stringArg()),
        userId: nonNull(stringArg())
    },
    resolve: async (_, { point, name, userId }, ctx) => {
        await addPoint(point, name, userId)
        const user = await ctx.prisma.user.findUnique({
            where: { id: userId }
        })
        return user
    }
})