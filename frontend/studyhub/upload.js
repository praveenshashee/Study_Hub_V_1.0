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
uploadForm.addEventListener("submit", (event) => {
  // Prevent page refresh when form is submitted
  event.preventDefault();

  // Get values from input fields
  const title = document.getElementById("title").value;
  const subject = document.getElementById("subject").value;
  const description = document.getElementById("description").value;
  const videoUrl = document.getElementById("videoUrl").value;
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

  if (isEmpty(uploader)) {
    message.innerHTML = "<p class='error'>Uploader Name is required.</p>";
    return;
  }

  // If all validations pass
  message.innerHTML = "<p class='success'>Form submitted successfully!</p>";

  // Optional: reset form after successful submission
  uploadForm.reset();
});