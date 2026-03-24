// Get the details container from HTML
const detailsContainer = document.getElementById("details-container");

// Read the id value from the URL
// Example: video-details.html?id=1
const params = new URLSearchParams(window.location.search);
const videoId = params.get("id");

// First, send a PATCH request to increase the view count
fetch(`http://localhost:5001/api/videos/${videoId}/view`, {
  method: "PATCH"
})
  .then((response) => response.json())
  .then((video) => {
    console.log(video);

    // Show the updated video details on the page
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
        <p><a href="${video.materials.slides}" target="_blank">Lecture Slides</a></p>
        <p><a href="${video.materials.labSheet}" target="_blank">Lab Sheet</a></p>
        <p><a href="${video.materials.modelPaper}" target="_blank">Model Paper</a></p>
      </div>
    `;
  })
  .catch((error) => {
    console.error("Error updating view count:", error);
    detailsContainer.innerHTML = "<p>Failed to load video details.</p>";
  });