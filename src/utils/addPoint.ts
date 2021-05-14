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
}

export default addPoint