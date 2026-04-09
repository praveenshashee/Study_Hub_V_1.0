import { useEffect, useRef } from "react";

const DEFAULT_UPLOAD_SOURCES = ["local", "url", "camera"];

function CloudinaryUploadButton({
  onUploadSuccess,
  buttonLabel = "Upload File to Cloudinary",
  cloudName = "de9xr5nq4",
  uploadPreset = "studyhub_videos",
  resourceType = "video",
  sources = DEFAULT_UPLOAD_SOURCES,
  className = ""
}) {
  const widgetRef = useRef(null);
  const onUploadSuccessRef = useRef(onUploadSuccess);

  useEffect(() => {
    onUploadSuccessRef.current = onUploadSuccess;
  }, [onUploadSuccess]);

  useEffect(() => {
    if (!window.cloudinary) return;

    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        resourceType,
        multiple: false,
        sources
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          onUploadSuccessRef.current?.(result.info);
        }
      }
    );
  }, [cloudName, resourceType, sources, uploadPreset]);

  const handleOpenWidget = () => {
    if (widgetRef.current) {
      widgetRef.current.open();
    }
  };

  return (
    <button type="button" onClick={handleOpenWidget} className={className}>
      {buttonLabel}
    </button>
  );
}

export default CloudinaryUploadButton;
