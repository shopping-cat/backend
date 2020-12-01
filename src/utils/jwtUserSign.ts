import jwt from 'jsonwebtoken'
import { Context } from '../context'
import { USER_ACCESS_TOKEN_NAME, USER_JWT_EXPRISEIN } from '../values'

const jwtUserSign = (userId: string, ctx: Context) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: USER_JWT_EXPRISEIN })
    ctx.expressContext.res.cookie(USER_ACCESS_TOKEN_NAME as string, token, {
        maxAge: USER_JWT_EXPRISEIN,
        httpOnly: true,
        // sameSite: 'none',
        // secure: process.env.NODE_ENV === 'production',
        // domain: process.env.NODE_ENV === 'production' ? '.react-graphql.shop' : undefined
    })
    return
}

export default jwtUserSign