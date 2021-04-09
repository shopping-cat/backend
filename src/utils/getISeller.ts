import { Context, prisma } from '../context'
import { sellerAuth } from '../lib/firebase'
import errorFormat from './errorFormat'


export const getISeller = async (ctx: Context) => {
    let token = ctx.expressContext.req.headers.authorization
    if (!token) throw errorFormat('로그인이 필요합니다')

    token = token.replace('Bearer ', '')

    const { email } = await sellerAuth.verifyIdToken(token)

    const seller = await prisma.seller.findUnique({ where: { email } })
    if (!seller) throw errorFormat('다시 로그인해주세요')
    return seller
}


export default getISeller