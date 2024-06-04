import pkg from 'cloudinary';
const { v2: cloudinary } = pkg;
import dotenv from 'dotenv'
dotenv.config()
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// export async function deleteFile(public_id) {
//     try {
//         const result = await cloudinary.uploader.destroy(public_id);
//         console.log(result);
//     } catch (error) {
//         console.error(error);
//     }
// }
