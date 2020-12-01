import { makeSchema } from '@nexus/schema'
import { nexusPrisma } from 'nexus-plugin-prisma'

import * as types from '../types'
import * as scalars from '../scalars'
import * as resolvers from '../resolvers/partner'


export const schema = makeSchema({
    types: [scalars, types, resolvers],
    plugins: [nexusPrisma()],
    outputs: {
        schema: __dirname + '/../../schema_partner.graphql',
        typegen: __dirname + '/../generated/nexus_partner.ts',
    },
    typegenAutoConfig: {
        contextType: 'Context.Context',
        sources: [
            {
                source: '@prisma/client',
                alias: 'prisma',
            },
            {
                source: require.resolve('../context'),
                alias: 'Context',
            },
        ],
    }
})