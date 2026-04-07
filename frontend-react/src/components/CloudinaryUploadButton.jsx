import { useEffect, useRef } from "react";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET
} from "../config.js";

function CloudinaryUploadButton({ onUploadSuccess }) {
  const widgetRef = useRef(null);
  const isCloudinaryReady = Boolean(
    CLOUDINARY_CLOUD_NAME &&
    CLOUDINARY_UPLOAD_PRESET
  );

  useEffect(() => {
    if (!window.cloudinary || !isCloudinaryReady) return;

    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        resourceType: "video",
        multiple: false,
        sources: ["local", "url", "camera"]
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          onUploadSuccess(result.info);
        }
      }
    );
  }, [isCloudinaryReady, onUploadSuccess]);

  const handleOpenWidget = () => {
    if (widgetRef.current) {
      widgetRef.current.open();
    }
  };

  return (
    <button type="button" onClick={handleOpenWidget} disabled={!isCloudinaryReady}>
      Upload Video to Cloudinary
    </button>
  );
}

export default CloudinaryUploadButton;
