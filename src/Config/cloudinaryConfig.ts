import { UploadApiResponse, v2 as cloudinary } from "cloudinary";

const cloudinaryUtil = cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinaryUtil;
