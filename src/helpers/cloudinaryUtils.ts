import { UploadApiResponse, v2 as cloudinary } from "cloudinary";
import cloudinaryUtil from "../Config/cloudinaryConfig";
import streamifier from "streamifier";

const cloudinaryConfig = cloudinaryUtil;
export async function uploadfiles(files: Express.Multer.File[]) {
  try {
    const uploadPromises = files.map((file) => {
      return new Promise<UploadApiResponse>((resolve, reject) => {
        const stream_to_cloud_pipe = cloudinary.uploader.upload_stream(
          { folder: "OtpTask" },
          (error, result) => {
            if (error) return reject(error);
            if (result) {
              return resolve(result);
            }
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream_to_cloud_pipe);
      });
    });

    const results = await Promise.all(uploadPromises);
    const images = results?.map((imageData) => {
      return imageData?.url;
    });
    return Promise.resolve(images);
  } catch (err) {
    return Promise.reject(err);
  }
}
