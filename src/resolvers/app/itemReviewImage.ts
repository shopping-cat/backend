import { mutationField, nonNull } from "nexus";
import { uploadImage } from "../../lib/googleCloudStorage";


// Mutation - 아이템 이미지 생성
export const createItemReviewImage = mutationField(t => t.field('createItemReviewImage', {
    type: 'ItemReviewImage',
    args: {
        image: nonNull('Upload')
    },
    resolve: async (_, { image }, ctx) => {

        const uri = await uploadImage(image, 'review-item-image/')
        const itemReviewImage = await ctx.prisma.itemReviewImage.create({
            data: {
                uri
            }
        })
        return itemReviewImage
    }
}))