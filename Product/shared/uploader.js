import pkg from 'cloudinary';
const { v2: cloudinary } = pkg;
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv'
dotenv.config()
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    allowedFormats: ['jpg', 'png', 'jpeg', 'xlsx'],
    params: {
        folder: "Product"
    }
});

export async function deleteFileByUrl(imageUrl) {
    try {
  
      const public_id = await getPublicIdFromUrl(imageUrl);
      console.log(public_id)
      const result = await cloudinary.uploader.destroy(public_id);
      console.log(result)
      if (result.result === "ok") {
        console.log("Deleted file successfully");
      } else {
        console.log("Public ID not found or something went wrong!");
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  }
  
  async function getPublicIdFromUrl(imageUrl) {
    try {
      const response = await cloudinary.uploader.upload(imageUrl);
      return response.public_id;
    } catch (error) {
      console.error("Error getting public_id:", error.message);
      throw error;
    }
  }

const uploadCloud = multer({ storage });

export default uploadCloud;