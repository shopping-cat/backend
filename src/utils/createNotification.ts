import { Prisma } from ".prisma/client"
import { prisma } from "../context"
import { userMessaging } from '../lib/firebase'
import errorFormat from "./errorFormat"



const createNotification = async (notiData: Prisma.NotificationCreateInput, userId: string, isEventMessage = false, disablePush = false) => {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    })

    if (!user) throw errorFormat('유효하지 않은 유저입니다')
    const notification = await prisma.notification.create({
        data: notiData
    })
    if (user.fcmToken && !disablePush && (!isEventMessage || user.eventMessageAllow)) {
        const res = await userMessaging.send({
            token: user.fcmToken,
            data: {
                title: notification.title,
                body: notification.content
            },
            notification: {
                title: notification.title,
                body: notification.content
            }
        })
        console.log(res)
    }
    return notification
}

export default createNotification