import { Context } from "../context"

const addPoint = async (point: number, name: string, userId: string, ctx: Context) => {
    // 영수증 생성
    await ctx.prisma.pointReceipt.create({
        data: {
            user: { connect: { id: userId } },
            name,
            point
        }
    })
    // 포인트 적용
    await ctx.prisma.user.update({
        where: { id: userId },
        data: {
            point: { increment: point }
        }
    })
}

export default addPoint