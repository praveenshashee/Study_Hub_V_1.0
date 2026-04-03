const uploadForm = document.getElementById("upload-form");
const message = document.getElementById("message");

function isEmpty(value) {
  return value.trim() === "";
}

function isValidUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

function setMessage(type, text) {
  message.className = type;
  message.textContent = text;
}

function clearMessage() {
  message.className = "";
  message.textContent = "";
}

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const description = document.getElementById("description").value.trim();
  const videoUrl = document.getElementById("videoUrl").value.trim();
  const slidesUrl = document.getElementById("slidesUrl").value.trim();
  const labSheetUrl = document.getElementById("labSheetUrl").value.trim();
  const modelPaperUrl = document.getElementById("modelPaperUrl").value.trim();
  const uploader = document.getElementById("uploader").value.trim();

  clearMessage();

  if (isEmpty(title)) {
    setMessage("error", "Video Title is required.");
    return;
  }

  if (title.length < 3) {
    setMessage("error", "Video Title must have at least 3 characters.");
    return;
  }

  if (isEmpty(subject)) {
    setMessage("error", "Subject is required.");
    return;
  }

  if (isEmpty(description)) {
    setMessage("error", "Description is required.");
    return;
  }

  if (description.length < 10) {
    setMessage("error", "Description must have at least 10 characters.");
    return;
  }

  if (isEmpty(videoUrl) || !isValidUrl(videoUrl)) {
    setMessage("error", "Please enter a valid Video URL.");
    return;
  }

  if (isEmpty(slidesUrl) || !isValidUrl(slidesUrl)) {
    setMessage("error", "Please enter a valid Lecture Slides URL.");
    return;
  }

  if (isEmpty(labSheetUrl) || !isValidUrl(labSheetUrl)) {
    setMessage("error", "Please enter a valid Lab Sheet URL.");
    return;
  }

  if (isEmpty(modelPaperUrl) || !isValidUrl(modelPaperUrl)) {
    setMessage("error", "Please enter a valid Model Paper URL.");
    return;
  }

  if (isEmpty(uploader)) {
    setMessage("error", "Uploader Name is required.");
    return;
  }

  try {
    const response = await fetch(window.StudyHubApi.buildUrl("/api/videos"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        subject,
        description,
        videoUrl,
        slidesUrl,
        labSheetUrl,
        modelPaperUrl,
        uploader
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage("error", data.message || "Failed to upload video.");
      return;
    }

    setMessage("success", "Video uploaded successfully!");
    uploadForm.reset();
  } catch (error) {
    console.error("Error submitting form:", error);
    setMessage("error", "Failed to connect to backend.");
  }
});
