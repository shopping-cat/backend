import { User } from '.prisma/client'
import { Context, prisma } from '../context'
import { catUserAuth, dogUserAuth } from '../lib/firebase'
import errorFormat from './errorFormat'

// TODO @ts-ignore
export const getIUser = async <B = false>(ctx: Context, ignoreError?: B): Promise<B extends true ? User | null : User> => {
    let token = ctx.expressContext.req.headers.authorization
    let isCat = true
    if (!token) {
        //@ts-ignore
        if (ignoreError) return null
        else throw errorFormat('로그인이 필요한 작업입니다')
    }
    if (ctx.expressContext.req.headers.type === 'dog') isCat = false

    token = token.replace('Bearer ', '')

    let id = ''

    if (isCat) {
        const { uid } = await catUserAuth.verifyIdToken(token)
        id = uid
    } else {
        const { uid } = await dogUserAuth.verifyIdToken(token)
        id = uid
    }

    // uid에 해당하는 user filed 가 없다면 유저를 생성
    let user = await prisma.user.findFirst({ where: { id } })
    if (!user) {
        user = await prisma.user.create({ data: { id, type: isCat ? 'cat' : 'dog' } })
    }
    //@ts-ignore
    return user
}

export default getIUser