import { Context, prisma } from "../context"

const addPoint = async (point: number, name: string, userId: string) => {
    // 영수증 생성
    await prisma.pointReceipt.create({
        data: {
            user: { connect: { id: userId } },
            name,
            point
        }
    })
    // 포인트 적용
    await prisma.user.update({
        where: { id: userId },
        data: {
            point: { increment: point }
        }
    })
}

export default addPoint