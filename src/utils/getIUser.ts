import { User } from '.prisma/client'
import { Context, prisma } from '../context'
import { userAuth } from '../lib/firebase'
import errorFormat from './errorFormat'

// TODO @ts-ignore
export const getIUser = async <B = false>(ctx: Context, ignoreError?: B): Promise<B extends true ? User | null : User> => {
    let token = ctx.expressContext.req.headers.authorization
    if (!token) {
        //@ts-ignore
        if (ignoreError) return null
        else throw errorFormat('로그인이 필요한 작업입니다')
    }

    token = token.replace('Bearer ', '')

    const { uid: id } = await userAuth.verifyIdToken(token)

    // uid에 해당하는 user filed 가 없다면 유저를 생성
    let user = await prisma.user.findFirst({ where: { id } })
    if (!user) {
        user = await prisma.user.create({ data: { id } })
    }
    //@ts-ignore
    return user
}

export default getIUser