import { Storage } from '@google-cloud/storage';
import { FileUpload } from 'graphql-upload';
import { v4 } from 'uuid';
import errorFormat from '../utils/errorFormat';


const storage = new Storage()
const bucket = storage.bucket('shoppingcat')

export const uploadImage = async (file: Promise<FileUpload>, path?: string): Promise<string> => {
    try {
        const { createReadStream, filename } = await file

        const temp = filename.split('.')
        const fileType = temp[temp.length - 1]
        let fileName = path + v4() + '.' + fileType

        const uri = await new Promise<string>((resolve, reject) => {
            createReadStream().pipe(bucket
                .file(fileName)
                .createWriteStream()
                .on("finish", () => {
                    resolve(`https://storage.googleapis.com/${bucket.name}/${fileName}`);
                })
            )
        })
        return uri
    } catch (error) {
        console.error(error)
        throw errorFormat('이미지 업로드 실패')
    }
}

export default storage