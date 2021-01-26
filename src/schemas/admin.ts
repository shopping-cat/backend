import { makeSchema } from 'nexus'
import { nexusPrisma } from 'nexus-plugin-prisma'

import * as types from '../types'
import * as scalars from '../scalars'
import * as resolvers from '../resolvers/admin'


export const schema = makeSchema({
    types: [scalars, types, resolvers],
    plugins: [nexusPrisma()],
    outputs: {
        schema: __dirname + '/../../schema_admin.graphql',
        typegen: __dirname + '/../generated/nexus_admin.ts',
    },
    // typegenAutoConfig: {
    //     contextType: 'Context.Context',
    //     sources: [
    //         {
    //             source: '@prisma/client',
    //             alias: 'prisma',
    //         },
    //         {
    //             source: require.resolve('../context'),
    //             alias: 'Context',
    //         },
    //     ],
    // }
})