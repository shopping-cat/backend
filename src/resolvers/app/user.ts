/* 
 *
 */
import { idArg, intArg, mutationField, nonNull, queryField, stringArg } from "nexus"
import Axios from "axios"
import { prisma } from "../../context"
import { userAuth } from "../../lib"
import getIUser from "../../utils/getIUser"

// Query - 내 정보를 가져옴
export const iUser = queryField(t => t.field('iUser', {
    type: 'User',
    resolve: async (_, { }, ctx) => {
        const user = await getIUser(ctx)

        return user
    }
}))

// kakao access token을 firebase token 으로 변경
export const kakaoTokenToFirebaseToken = queryField(t => t.nonNull.field('kakaoTokenToFirebaseToken', {
    type: 'String', // firebase token
    args: {
        kakaoAccessToken: nonNull(stringArg())
    },
    resolve: async (_, { kakaoAccessToken }, ctx) => {
        try {
            // 카카오 rest api 로 유저 세부 정보 가져오기
            const result = await Axios.post(
                'https://kapi.kakao.com/v2/user/me',
                { property_keys: ['kakao_account.email', 'properties.nickname', 'properties.profile_image'] },
                { headers: { 'Authorization': `Bearer ${kakaoAccessToken}` } }
            )
            if (!result.data.id) throw new Error('No Id')
            const kakaoUserId = `KAKAO:${result.data.id}`
            const properties = {
                email: result?.data?.kakao_account?.email,
                displayName: result?.data?.properties?.nickname || null,
                photoURL: result?.data?.properties?.profile_image || null,
            }

            // 파이어베이스에 유저 생성 or 업데이트
            try {
                await userAuth.updateUser(kakaoUserId, properties)
            } catch (error) {
                if (error.code !== 'auth/user-not-found') throw error
                console.log('create')
                await userAuth.createUser({ ...properties, uid: kakaoUserId })
            }

            // 파이어베이스 토큰 생성
            const firebaseToken = await userAuth.createCustomToken(kakaoUserId, { provider: 'KAKAO' })
            return firebaseToken
        } catch (error) {
            console.log(error)
            throw error
        }
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
