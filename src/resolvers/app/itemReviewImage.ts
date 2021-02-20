import { mutationField, nonNull } from "nexus";
import { uploadImage } from "../../lib/googleCloudStorage";
import asyncDelay from "../../utils/asyncDelay";

// Mutation - 아이템 이미지 생성
export const createItemReviewImage = mutationField(t => t.field('createItemReviewImage', {
    type: 'ItemReviewImage',
    args: {
        image: nonNull('Upload')
    },
    resolve: async (_, { image }, ctx) => {
        await asyncDelay()
        const uri = await uploadImage(image, 'review-item-image/')
        const itemReviewImage = await ctx.prisma.itemReviewImage.create({
            data: {
                uri
            }
        })
        return itemReviewImage
    }
}))