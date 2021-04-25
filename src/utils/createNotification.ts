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
    if (user.fcmToken && !disablePush && (!isEventMessage || !!user.eventMessageAllowDate)) {
        try {
            await userMessaging.send({
                token: user.fcmToken,
                data: {
                    title: notification.title,
                    body: notification.content,
                    type: 'notification'
                },
                notification: {
                    title: notification.title,
                    body: notification.content
                }
            })
        } catch (error) {

        }
    }
    return notification
}

export default createNotification