import { useEffect, useRef } from "react";

function CloudinaryUploadButton({ onUploadSuccess }) {
  const widgetRef = useRef(null);

  useEffect(() => {
    if (!window.cloudinary) return;

    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName: "de9xr5nq4",
        uploadPreset: "studyhub_videos",
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
  }, [onUploadSuccess]);

  const handleOpenWidget = () => {
    if (widgetRef.current) {
      widgetRef.current.open();
    }
  };

  return (
    <button type="button" onClick={handleOpenWidget}>
      Upload Video to Cloudinary
    </button>
  );
}

export default CloudinaryUploadButton;