import { Context } from "../context"

const getType = (ctx: Context) => {
    return ctx.expressContext.req.headers.type === 'dog' ? 'dog' : 'cat'
}

export default getType