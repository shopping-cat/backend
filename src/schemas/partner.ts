import { makeSchema } from 'nexus'
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
    }
})