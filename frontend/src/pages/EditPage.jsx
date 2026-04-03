import { useNavigate, useParams } from "react-router-dom";
import StatusPanel from "../components/StatusPanel.jsx";
import VideoForm from "../components/VideoForm.jsx";

export default function EditPage({ appState }) {
  const { videos, isLoading, loadError, updateVideo } = appState;
  const { videoId } = useParams();
  const navigate = useNavigate();

  const numericVideoId = Number(videoId);
  const video = videos.find((entry) => entry.id === numericVideoId);

  if (!Number.isInteger(numericVideoId) || numericVideoId <= 0) {
    return (
      <StatusPanel
        tone="error"
        title="Invalid video id"
        description="The resource you are trying to edit does not exist."
      />
    );
  }

  if (isLoading && !video) {
    return (
      <StatusPanel
        title="Loading resource for editing"
        description="Getting the current details so the form can be pre-filled."
      />
    );
  }

  if (loadError && !video) {
    return (
      <StatusPanel
        tone="error"
        title="Unable to load this resource"
        description={loadError}
      />
    );
  }

  if (!video) {
    return (
      <StatusPanel
        tone="error"
        title="Video not found"
        description="This resource may have been removed already."
      />
    );
  }

  return (
    <VideoForm
      heading="Edit learning resource"
      description="Update the details for an existing study video and keep the catalog in sync."
      initialVideo={video}
      submitLabel="Update resource"
      successMessage="Video updated successfully."
      onSubmit={(payload) => updateVideo(numericVideoId, payload)}
      onSuccess={(savedVideo) => {
        navigate(`/videos/${savedVideo.id}`);
      }}
    />
  );
}
