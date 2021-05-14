import { prisma } from "../context"

const getUserPoint = async (userId: string) => {
    const { sum } = await prisma.pointReceipt.aggregate({
        where: { userId },
        sum: { point: true }
    })
    const point = sum.point || 0
    return point < 0 ? 0 : point
}

export default getUserPoint