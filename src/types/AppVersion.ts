import { objectType } from 'nexus'


export const AppVersion = objectType({
    name: 'AppVersion',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.majorVersion()
        t.model.minorVersion()
        t.model.patchVersion()
        t.model.updateRequire()
        t.model.appstoreDistributed()
        t.model.playstoreDistributed()
        t.string('version', {
            resolve: ({ majorVersion, minorVersion, patchVersion }) => `${majorVersion}.${minorVersion}.${patchVersion}`
        })
    }
})
