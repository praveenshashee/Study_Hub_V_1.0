// Get form and message box from HTML
const uploadForm = document.getElementById("upload-form");
const message = document.getElementById("message");

// This function checks if a text value is empty or only spaces
function isEmpty(value) {
  return value.trim() === "";
}

// This function checks whether a URL starts with http:// or https://
function isValidUrl(url) {
  return url.startsWith("http://") || url.startsWith("https://");
}

// Listen for form submission
uploadForm.addEventListener("submit", async (event) => {
  // Prevent page refresh when form is submitted
  event.preventDefault();

// Get values from input fields
const title = document.getElementById("title").value;
const subject = document.getElementById("subject").value;
const description = document.getElementById("description").value;
const videoUrl = document.getElementById("videoUrl").value;
const slidesUrl = document.getElementById("slidesUrl").value;
const labSheetUrl = document.getElementById("labSheetUrl").value;
const modelPaperUrl = document.getElementById("modelPaperUrl").value;
const uploader = document.getElementById("uploader").value;

  // Clear old message
  message.innerHTML = "";

  // Validation checks
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

  if (isEmpty(videoUrl)) {
    message.innerHTML = "<p class='error'>Video URL is required.</p>";
    return;
  }

  if (!isValidUrl(videoUrl)) {
    message.innerHTML = "<p class='error'>Please enter a valid Video URL.</p>";
    return;
  }

  // Validate lecture slides URL
  if (isEmpty(slidesUrl)) {
    message.innerHTML = "<p class='error'>Lecture Slides URL is required.</p>";
    return;
  }

  if (!isValidUrl(slidesUrl)) {
    message.innerHTML = "<p class='error'>Please enter a valid Lecture Slides URL.</p>";
    return;
  }

  // Validate lab sheet URL
  if (isEmpty(labSheetUrl)) {
    message.innerHTML = "<p class='error'>Lab Sheet URL is required.</p>";
    return;
  }

  if (!isValidUrl(labSheetUrl)) {
    message.innerHTML = "<p class='error'>Please enter a valid Lab Sheet URL.</p>";
    return;
  }

  // Validate model paper URL
  if (isEmpty(modelPaperUrl)) {
    message.innerHTML = "<p class='error'>Model Paper URL is required.</p>";
    return;
  }

  if (!isValidUrl(modelPaperUrl)) {
    message.innerHTML = "<p class='error'>Please enter a valid Model Paper URL.</p>";
    return;
  }

  if (isEmpty(uploader)) {
    message.innerHTML = "<p class='error'>Uploader Name is required.</p>";
    return;
  }

  try {
    // Send form data to backend API
    const response = await fetch("http://localhost:5001/api/videos", {
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
      message.innerHTML = `<p class='error'>${data.message}</p>`;
      return;
    }

    // Success message
    message.innerHTML = "<p class='success'>Video uploaded successfully!</p>";

    // Reset form after successful upload
    uploadForm.reset();

    console.log("Uploaded video:", data.video);
  } catch (error) {
    console.error("Error submitting form:", error);
    message.innerHTML = "<p class='error'>Failed to connect to backend.</p>";
  }
});