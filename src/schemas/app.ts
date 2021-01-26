import { makeSchema } from 'nexus'
import { nexusPrisma } from 'nexus-plugin-prisma'

import * as types from '../types'
import * as scalars from '../scalars'
import * as resolvers from '../resolvers/app'


export const schema = makeSchema({
    types: [scalars, types, resolvers],
    shouldGenerateArtifacts: process.env.NODE_ENV === 'development',
    plugins: [nexusPrisma()],
    outputs: {
        schema: __dirname + '/../../schema_app.graphql',
        typegen: __dirname + '/../generated/nexus_app.ts',
    }
})