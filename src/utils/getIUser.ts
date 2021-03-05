import { Context, prisma } from '../context'
import { userAuth } from '../lib/firebase'
import errorFormat from './errorFormat'


export const getIUser = async (ctx: Context) => {
    try {
        let token = ctx.expressContext.req.headers.authorization
        if (!token) throw errorFormat('로그인이 필요한 작업입니다')

        token = token.replace('Bearer ', '')

        const { uid: id } = await userAuth.verifyIdToken(token)

        // uid에 해당하는 user filed 가 없다면 유저를 생성
        let user = await prisma.user.findFirst({ where: { id } })
        if (!user) {
            user = await prisma.user.create({ data: { id } })
        }

        return user
    } catch (error) {
        console.log(error)
        throw error
    }
}


export default getIUser