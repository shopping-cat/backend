import { inputObjectType, intArg, mutationField, nonNull, queryField } from "nexus"

export const appVersions = queryField(t => t.list.field('appVersions', {
    type: 'AppVersion',
    resolve: (_, { }, ctx) => {
        return ctx.prisma.appVersion.findMany({
            orderBy: { createdAt: 'desc' }
        })
    }
}))

export const createAppVersion = mutationField(t => t.field('createAppVersion', {
    type: 'AppVersion',
    args: {
        input: nonNull(inputObjectType({
            name: 'CreateAppVersionInput',
            definition: (t) => {
                t.nonNull.int('majorVersion')
                t.nonNull.int('minorVersion')
                t.nonNull.int('patchVersion')
                t.nonNull.boolean('updateRequire')
                t.nonNull.boolean('playstoreDistributed')
                t.nonNull.boolean('appstoreDistributed')
            }
        }))
    },
    resolve: (_, { input }, ctx) => {
        console.log(input)
        return ctx.prisma.appVersion.create({
            data: input
        })
    }
}))

export const deleteAppVersion = mutationField(t => t.field('deleteAppVersion', {
    type: 'AppVersion',
    args: {
        id: nonNull(intArg())
    },
    resolve: (_, { id }, ctx) => {
        return ctx.prisma.appVersion.delete({
            where: { id }
        })
    }
}))

export const updateAppVersion = mutationField(t => t.field('updateAppVersion', {
    type: 'AppVersion',
    args: {
        input: nonNull(inputObjectType({
            name: 'UpdateAppVersionInput',
            definition: (t) => {
                t.nonNull.int('id')
                t.nullable.int('majorVersion')
                t.nullable.int('minorVersion')
                t.nullable.int('patchVersion')
                t.nullable.boolean('updateRequire')
                t.nullable.boolean('playstoreDistributed')
                t.nullable.boolean('appstoreDistributed')
            }
        }))
    },
    resolve: async (_, { input }, ctx) => {
        console.log(input)
        return ctx.prisma.appVersion.update({
            where: { id: input.id },
            data: {
                majorVersion: input.majorVersion || undefined,
                minorVersion: input.minorVersion || undefined,
                patchVersion: input.patchVersion || undefined,
                updateRequire: input.updateRequire != null ? input.updateRequire : undefined,
                playstoreDistributed: input.playstoreDistributed != null ? input.playstoreDistributed : undefined,
                appstoreDistributed: input.appstoreDistributed != null ? input.appstoreDistributed : undefined,
            }
        })
    }
}))