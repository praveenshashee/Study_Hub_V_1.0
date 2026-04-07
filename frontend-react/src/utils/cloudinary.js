import { CLOUDINARY_CLOUD_NAME } from "../config.js";

export const buildCloudinaryThumbnailUrl = (publicId) => {
  if (!CLOUDINARY_CLOUD_NAME || !publicId) {
    return "";
  }

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/so_1/${publicId}.jpg`;
};
