import { makeSchema } from 'nexus'
import { nexusPrisma } from 'nexus-plugin-prisma'
import { DateTimeResolver, JSONObjectResolver } from 'graphql-scalars'
import { GraphQLScalarType } from 'graphql'

import * as types from '../types'
import * as scalars from '../scalars'
import * as resolvers from '../resolvers/seller'


export const schema = makeSchema({
    types: [scalars, types, resolvers],
    shouldGenerateArtifacts: process.env.NODE_ENV === 'development',
    outputs: {
        schema: __dirname + '/../../schema_seller.graphql',
        typegen: __dirname + '/../generated/nexus_seller.d.ts',
    },
    contextType: {
        module: require.resolve('../context'),
        export: 'Context',
    },
    sourceTypes: {
        modules: [
            {
                module: require.resolve('.prisma/client/index.d.ts'),
                alias: 'prisma',
            },
        ],
    },
    plugins: [nexusPrisma({
        scalars: {
            DateTime: DateTimeResolver,
            Json: new GraphQLScalarType({
                ...JSONObjectResolver,
                name: 'Json',
            })
        }
    })],
})