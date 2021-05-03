import compareVersions from 'compare-versions';
import { intArg, nonNull, queryField, stringArg } from "nexus"
import errorFormat from "../../utils/errorFormat"


// 업데이트 가능, 업데이트 필요, 최신, DEV
export const checkVersion = queryField(t => t.field('checkVersion', {
    type: 'String',
    args: {
        version: nonNull(stringArg()),
        os: nonNull(stringArg())
    },
    resolve: async (_, { version, os }, ctx) => {

        const splitedVersion: string[] = version.split('.')

        if (splitedVersion.length !== 3) throw errorFormat('형식에 맞지 않는 버전 입니다')
        if (os !== 'aos' && os !== 'ios') throw errorFormat('ios와 aos만 지원합니다')

        const majorVersion = Number(splitedVersion[0])
        const minorVersion = Number(splitedVersion[1])
        const patchVersion = Number(splitedVersion[2])

        // 배포된 버전 중에 가장 높은 버전
        const currentVersion = await ctx.prisma.appVersion.findFirst({
            orderBy: { createdAt: 'desc' },
            where: {
                appstoreDistributed: os === 'ios' ? true : undefined,
                playstoreDistributed: os === 'aos' ? true : undefined
            }
        })
        if (!currentVersion) throw errorFormat('유효한 버전이 없습니다')
        const compareVersion = `${currentVersion.majorVersion}.${currentVersion.minorVersion}.${currentVersion.patchVersion}`

        const compare = compareVersions(compareVersion, version)
        if (compare === 0) return '최신' // 같을때
        if (compare === -1) return 'DEV' // version이 compareVersion보다 클때

        const targetVersion = await ctx.prisma.appVersion.findFirst({
            where: {
                majorVersion,
                minorVersion,
                patchVersion
            }
        })
        if (!targetVersion) return '업데이트 가능'
        // currentVersion과 targetVersion사이의 updateRequire이 하나라도 있다면 업데이트 필요로 변경
        const updateRequireVersion = await ctx.prisma.appVersion.findFirst({
            where: {
                AND: [
                    { createdAt: { gt: targetVersion.createdAt } },
                    { createdAt: { lte: currentVersion.createdAt } },
                    { updateRequire: true }
                ]
            }
        })
        if (!updateRequireVersion) return '업데이트 가능'
        return '업데이트 필요'
    }
}))