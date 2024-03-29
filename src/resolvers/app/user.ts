/* 
 *
 */
import { booleanArg, idArg, inputObjectType, intArg, mutationField, nonNull, nullable, queryField, stringArg } from "nexus"
import Axios from "axios"
import { catUserAuth, dogUserAuth } from "../../lib/firebase"
import getIUser from "../../utils/getIUser"

import errorFormat from "../../utils/errorFormat";
import { uploadImage } from "../../lib/googleCloudStorage"
import asyncDelay from "../../utils/asyncDelay";
import isCat from "../../utils/isCat";

// Query - 내 정보를 가져옴
export const iUser = queryField(t => t.field('iUser', {
    type: 'User',
    resolve: async (_, { }, ctx) => {
        await asyncDelay()
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
        // 카카오 rest api 로 유저 세부 정보 가져오기
        const result = await Axios.post(
            'https://kapi.kakao.com/v2/user/me',
            { property_keys: ['kakao_account.email', 'properties.nickname', 'properties.profile_image'] },
            { headers: { 'Authorization': `Bearer ${kakaoAccessToken}` } }
        )
        if (!result.data.id) throw errorFormat('유효하지 않은 아이디')
        const kakaoUserId = `KAKAO:${result.data.id}`
        const properties = {
            email: result?.data?.kakao_account?.email,
            displayName: result?.data?.properties?.nickname || undefined,
            photoURL: result?.data?.properties?.profile_image || undefined,
        }
        // 파이어베이스에 유저 생성 or 업데이트
        try {
            if (isCat(ctx)) await catUserAuth.updateUser(kakaoUserId, properties)
            else await dogUserAuth.updateUser(kakaoUserId, properties)
        } catch (error) {
            if (error.code !== 'auth/user-not-found') throw error
            if (isCat(ctx)) await catUserAuth.createUser({ ...properties, uid: kakaoUserId })
            else await dogUserAuth.updateUser(kakaoUserId, properties)
        }

        // 파이어베이스 토큰 생성
        const firebaseToken = isCat(ctx)
            ? await catUserAuth.createCustomToken(kakaoUserId, { provider: 'KAKAO' })
            : await dogUserAuth.createCustomToken(kakaoUserId, { provider: 'KAKAO' })

        return firebaseToken
    }
}))

export const withdrawalUser = mutationField(t => t.field('withdrawalUser', {
    type: 'User',
    resolve: async (_, { }, ctx) => {

        const user = await getIUser(ctx)
        return user
    }
}))

// MUTATION - 환불 계좌 업데이트
export const updateRefundBankAccount = mutationField(t => t.field('updateRefundBankAccount', {
    type: 'User',
    args: {
        ownerName: stringArg(),
        bankName: stringArg(),
        accountNumber: stringArg()
    },
    resolve: async (_, { ownerName, bankName, accountNumber }, ctx) => {

        const user = await getIUser(ctx)
        const refundBankAccount = await ctx.prisma.userRefundBankAccount.findUnique({ where: { userId: user.id } })
        if (refundBankAccount) { // update
            await ctx.prisma.userRefundBankAccount.update({
                where: { userId: user.id },
                data: {
                    bankName,
                    ownerName,
                    accountNumber
                }
            })
        } else { // create
            await ctx.prisma.userRefundBankAccount.create({
                data: {
                    bankName,
                    ownerName,
                    accountNumber,
                    user: { connect: { id: user.id } }
                }
            })
        }
        return user
    }
}))

// MUTATION - 유저 프로필 업데이트
export const updateUserProfile = mutationField(t => t.field('updateUserProfile', {
    type: 'User',
    args: {
        photo: nullable('Upload'),
        name: nullable('String')
    },
    resolve: async (_, { photo, name }, ctx) => {
        const { id } = await getIUser(ctx)

        const uri = photo ? await uploadImage(photo, 'user-profile-image/') : undefined

        const user = await ctx.prisma.user.update({
            where: { id },
            data: {
                name,
                photo: uri
            }
        })

        return user
    }
}))

export const registUserProfileInput = inputObjectType({
    name: 'RegistUserProfileInput',
    definition: (t) => {
        t.nonNull.string('name')
        t.nullable.upload('photo')
        t.nonNull.boolean('eventMessageAllow')
    }
})

export const registUserProfile = mutationField(t => t.field('registUserProfile', {
    type: 'User',
    args: {
        input: nonNull(registUserProfileInput)
    },
    resolve: async (_, { input }, ctx) => {

        const { name, photo, eventMessageAllow } = input
        const { id } = await getIUser(ctx)

        const uri = photo ? await uploadImage(photo, 'user-profile-image/') : undefined

        const nowDate = new Date

        const user = await ctx.prisma.user.update({
            where: { id },
            data: {
                name,
                photo: uri,
                eventMessageAllowDate: eventMessageAllow ? nowDate : null,
                privacyPolicyAllowDate: nowDate,
                termsOfServiceAllowDate: nowDate,
            }
        })

        return user
    }
}))

// MUTATION - 배송지 업데이트
export const updateDeliveryInfo = mutationField(t => t.field('updateDeliveryInfo', {
    type: 'User',
    args: {
        postCode: stringArg(),
        address: stringArg(),
        addressDetail: stringArg(),
        name: stringArg(),
        phone: stringArg()
    },
    resolve: async (_, { postCode, address, addressDetail, name, phone }, ctx) => {

        const user = await getIUser(ctx)
        const deliveryInfo = await ctx.prisma.userDeliveryInfo.findUnique({ where: { userId: user.id } })
        if (deliveryInfo) { // update
            await ctx.prisma.userDeliveryInfo.update({
                where: { userId: user.id },
                data: {
                    postCode,
                    address,
                    addressDetail,
                    name,
                    phone
                }
            })
        } else { // create
            await ctx.prisma.userDeliveryInfo.create({
                data: {
                    postCode,
                    address,
                    addressDetail,
                    name,
                    phone,
                    user: { connect: { id: user.id } }
                }
            })
        }
        return user
    }
}))
// MUTATION - 검색어 삭제
export const removeAllSearchKeywords = mutationField(t => t.field('removeAllSearchKeywords',
    {
        type: 'User',
        resolve: async (_, { }, ctx) => {
            const user = await getIUser(ctx)
            await ctx.prisma.searchKeyword.deleteMany({
                where: {
                    userId: user.id
                }
            })
            return user
        }
    }
))

export const updateFcmToken = mutationField(t => t.field('updateFcmToken', {
    type: 'User',
    args: {
        token: nonNull(stringArg())
    },
    resolve: async (_, { token }, ctx) => {
        const { id } = await getIUser(ctx)
        console.log(token)
        const user = await ctx.prisma.user.update({
            where: { id },
            data: { fcmToken: token }
        })
        return user
    }
}))

export const updateEventMessageAllow = mutationField(t => t.field('updateEventMessageAllow', {
    type: 'User',
    args: {
        allow: nonNull(booleanArg())
    },
    resolve: async (_, { allow }, ctx) => {
        const { id } = await getIUser(ctx)
        const user = await ctx.prisma.user.update({
            where: { id },
            data: { eventMessageAllowDate: allow ? new Date : null }
        })
        return user
    }
}))