import pkg from "cloudinary";
const { v2: cloudinary } = pkg;
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  allowedFormats: ["jpg", "png", "jpeg"],
  params: {
    folder: "Widget",
  },
  
});

const uploadCloud = multer({ storage: storage, limits: {
    fileSize: 100 * 1024 * 1024, // No larger than 10mb
    fieldSize: 100 * 1024 * 1024, // No larger than 10mb
} });

export default uploadCloud;
