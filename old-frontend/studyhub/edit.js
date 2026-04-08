// Get form and message area
const editForm = document.getElementById("edit-form");
const message = document.getElementById("message");

// Read video id from URL
const params = new URLSearchParams(window.location.search);
const videoId = params.get("id");

// Helper: check empty text
function isEmpty(value) {
  return value.trim() === "";
}

// Helper: simple URL validation
function isValidUrl(url) {
  return url.startsWith("http://") || url.startsWith("https://");
}

// Load current video data into the form
fetch(`http://localhost:5001/api/videos/${videoId}`)
  .then((response) => response.json())
  .then((video) => {
    // Fill existing values into inputs
    document.getElementById("title").value = video.title;
    document.getElementById("subject").value = video.subject;
    document.getElementById("description").value = video.description;
    document.getElementById("videoUrl").value = video.videoUrl;
    document.getElementById("slidesUrl").value = video.materials?.slides || "";
    document.getElementById("labSheetUrl").value = video.materials?.labSheet || "";
    document.getElementById("modelPaperUrl").value = video.materials?.modelPaper || "";
    document.getElementById("uploader").value = video.uploader;
  })
  .catch((error) => {
    console.error("Error loading video for edit:", error);
    message.innerHTML = "<p class='error'>Failed to load video details.</p>";
  });

// Handle form submission
editForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Read current form values
  const title = document.getElementById("title").value;
  const subject = document.getElementById("subject").value;
  const description = document.getElementById("description").value;
  const videoUrl = document.getElementById("videoUrl").value;
  const slidesUrl = document.getElementById("slidesUrl").value;
  const labSheetUrl = document.getElementById("labSheetUrl").value;
  const modelPaperUrl = document.getElementById("modelPaperUrl").value;
  const uploader = document.getElementById("uploader").value;

  // Clear previous message
  message.innerHTML = "";

  // Frontend validation
  if (isEmpty(title)) {
    message.innerHTML = "<p class='error'>Video Title is required.</p>";
    return;
  }

  if (title.trim().length < 3) {
    message.innerHTML = "<p class='error'>Video Title must have at least 3 characters.</p>";
    return;
  }

  if (isEmpty(subject)) {
    message.innerHTML = "<p class='error'>Subject is required.</p>";
    return;
  }

  if (isEmpty(description)) {
    message.innerHTML = "<p class='error'>Description is required.</p>";
    return;
  }

  if (description.trim().length < 10) {
    message.innerHTML = "<p class='error'>Description must have at least 10 characters.</p>";
    return;
  }

  if (isEmpty(videoUrl) || !isValidUrl(videoUrl)) {
    message.innerHTML = "<p class='error'>Please enter a valid Video URL.</p>";
    return;
  }

  if (isEmpty(slidesUrl) || !isValidUrl(slidesUrl)) {
    message.innerHTML = "<p class='error'>Please enter a valid Lecture Slides URL.</p>";
    return;
  }

  if (isEmpty(labSheetUrl) || !isValidUrl(labSheetUrl)) {
    message.innerHTML = "<p class='error'>Please enter a valid Lab Sheet URL.</p>";
    return;
  }

  if (isEmpty(modelPaperUrl) || !isValidUrl(modelPaperUrl)) {
    message.innerHTML = "<p class='error'>Please enter a valid Model Paper URL.</p>";
    return;
  }

  if (isEmpty(uploader)) {
    message.innerHTML = "<p class='error'>Uploader Name is required.</p>";
    return;
  }

  try {
    // Send updated data to backend
    const response = await fetch(`http://localhost:5001/api/videos/${videoId}`, {
      method: "PUT",
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
      message.innerHTML = `<p class='error'>${data.message}</p>`;
      return;
    }

    message.innerHTML = "<p class='success'>Video updated successfully!</p>";

    // Redirect back to details page after a short moment
    setTimeout(() => {
      window.location.href = `video-details.html?id=${videoId}`;
    }, 1000);
  } catch (error) {
    console.error("Error updating video:", error);
    message.innerHTML = "<p class='error'>Failed to connect to backend.</p>";
  }
});