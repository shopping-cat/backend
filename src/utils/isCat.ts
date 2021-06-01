import { Context } from "../context"

const isCat = (ctx: Context) => {
    return ctx.expressContext.req.headers.type === 'cat'
}

export default isCat