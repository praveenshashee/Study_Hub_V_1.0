import { useNavigate } from "react-router-dom";
import VideoForm from "../components/VideoForm.jsx";

export default function UploadPage({ appState }) {
  const navigate = useNavigate();

  return (
    <VideoForm
      heading="Upload a new learning resource"
      description="Create a new study video entry and keep your full resource catalog inside the new React interface."
      submitLabel="Submit resource"
      successMessage="Video uploaded successfully."
      resetOnSuccess
      onSubmit={appState.createVideo}
      onSuccess={(video) => {
        navigate(`/videos/${video.id}`);
      }}
    />
  );
}
