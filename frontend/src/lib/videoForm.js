function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function createEmptyVideoForm() {
  return {
    title: "",
    subject: "",
    description: "",
    videoUrl: "",
    slidesUrl: "",
    labSheetUrl: "",
    modelPaperUrl: "",
    uploader: ""
  };
}

export function createVideoFormFromVideo(video) {
  if (!video) {
    return createEmptyVideoForm();
  }

  return {
    title: video.title || "",
    subject: video.subject || "",
    description: video.description || "",
    videoUrl: video.videoUrl || "",
    slidesUrl: video.materials?.slides || "",
    labSheetUrl: video.materials?.labSheet || "",
    modelPaperUrl: video.materials?.modelPaper || "",
    uploader: video.uploader || ""
  };
}

export function validateVideoForm(values) {
  if (!values.title.trim()) {
    return "Video title is required.";
  }

  if (values.title.trim().length < 3) {
    return "Video title must have at least 3 characters.";
  }

  if (!values.subject.trim()) {
    return "Subject is required.";
  }

  if (!values.description.trim()) {
    return "Description is required.";
  }

  if (values.description.trim().length < 10) {
    return "Description must have at least 10 characters.";
  }

  const linkFields = [
    ["Video URL", values.videoUrl],
    ["Lecture Slides URL", values.slidesUrl],
    ["Lab Sheet URL", values.labSheetUrl],
    ["Model Paper URL", values.modelPaperUrl]
  ];

  for (const [label, fieldValue] of linkFields) {
    if (!fieldValue.trim() || !isValidUrl(fieldValue.trim())) {
      return `Please enter a valid ${label}.`;
    }
  }

  if (!values.uploader.trim()) {
    return "Uploader name is required.";
  }

  return "";
}

export function toVideoPayload(values) {
  return {
    title: values.title.trim(),
    subject: values.subject.trim(),
    description: values.description.trim(),
    videoUrl: values.videoUrl.trim(),
    slidesUrl: values.slidesUrl.trim(),
    labSheetUrl: values.labSheetUrl.trim(),
    modelPaperUrl: values.modelPaperUrl.trim(),
    uploader: values.uploader.trim()
  };
}
