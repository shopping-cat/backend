import { mutationField, nonNull } from "nexus"
import { uploadImage } from "../../lib/googleCloudStorage"
import asyncDelay from "../../utils/asyncDelay"

// Mutation - 아이템 이미지 생성
export const createItemImage = mutationField(t => t.field('createItemImage', {
    type: 'ItemImage',
    args: {
        image: nonNull('Upload')
    },
    resolve: async (_, { image }, ctx) => {
        await asyncDelay()
        const uri = await uploadImage(image, 'item-image/')
        const itemImage = await ctx.prisma.itemImage.create({
            data: {
                uri
            }
        })
        return itemImage
    }
}))