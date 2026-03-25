// Get the container where video details will be displayed
const detailsContainer = document.getElementById("details-container");

// Read the video id from the page URL
// Example: video-details.html?id=1
const params = new URLSearchParams(window.location.search);
const videoId = params.get("id");

// Function to return a safe material link or a fallback message
function getMaterialLink(url, label) {
  // If the URL is missing, null, or empty, show "Not available"
  if (!url || url === "null") {
    return `<p><strong>${label}:</strong> Not available</p>`;
  }

  // Otherwise, show the real clickable link
  return `<p><a href="${url}" target="_blank">${label}</a></p>`;
}

// First send a PATCH request to increase the view count
fetch(`http://localhost:5001/api/videos/${videoId}/view`, {
  method: "PATCH"
})
  .then((response) => response.json())
  .then((video) => {
    console.log("Loaded video details:", video);

    // Render the selected video details
    detailsContainer.innerHTML = `
      <div class="video-card">
        <h2>${video.title}</h2>
        <p><strong>Subject:</strong> ${video.subject}</p>
        <p><strong>Description:</strong> ${video.description}</p>
        <p><strong>Uploader:</strong> ${video.uploader}</p>
        <p><strong>Views:</strong> ${video.views}</p>
        <p><strong>Rating:</strong> ${video.rating}</p>
        <p><strong>Date:</strong> ${video.createdAt}</p>

        <h3>Study Materials</h3>
        ${getMaterialLink(video.materials?.slides, "Lecture Slides")}
        ${getMaterialLink(video.materials?.labSheet, "Lab Sheet")}
        ${getMaterialLink(video.materials?.modelPaper, "Model Paper")}

        <a href="edit-video.html?id=${video.id}" class="view-btn edit-btn">Edit Video</a>
        <button id="delete-btn" class="delete-btn">Delete Video</button>
      </div>
    `;

    // Get the delete button after rendering it
    const deleteBtn = document.getElementById("delete-btn");

    // Add click event to delete the current video
    deleteBtn.addEventListener("click", async () => {
      const confirmed = confirm("Are you sure you want to delete this video?");

      // Stop if user cancels
      if (!confirmed) {
        return;
      }

      try {
        // Send DELETE request to backend
        const response = await fetch(`http://localhost:5001/api/videos/${videoId}`, {
          method: "DELETE"
        });

        const data = await response.json();

        // If backend returns an error
        if (!response.ok) {
          alert(data.message || "Failed to delete video");
          return;
        }

        alert("Video deleted successfully!");

        // Redirect back to the main page
        window.location.href = "index.html";
      } catch (error) {
        console.error("Error deleting video:", error);
        alert("Failed to connect to backend");
      }
    });
  })
  .catch((error) => {
    console.error("Error loading video details:", error);
    detailsContainer.innerHTML = "<p>Failed to load video details.</p>";
  });