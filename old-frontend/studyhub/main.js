// This variable stores all videos from the backend
let allVideos = [];

// These variables connect JavaScript with HTML elements
const videoContainer = document.getElementById("video-container");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");

// This function displays video cards on the page
function displayVideos(videos) {
  // Clear previous cards before showing new ones
  videoContainer.innerHTML = "";

  // If no videos match, show a message
  if (videos.length === 0) {
    videoContainer.innerHTML = "<p>No videos found.</p>";
    return;
  }

  // Loop through each video and create a card
  videos.forEach((video) => {
    const videoCard = document.createElement("div");
    videoCard.classList.add("video-card");

    videoCard.innerHTML = `
      <h3>${video.title}</h3>
      <p><strong>Subject:</strong> ${video.subject}</p>
      <p><strong>Views:</strong> ${video.views}</p>
      <p><strong>Rating:</strong> ${video.rating}</p>
      <p><strong>Date:</strong> ${video.createdAt}</p>
      <a href="video-details.html?id=${video.id}" class="view-btn">View More</a>
    `;

    videoContainer.appendChild(videoCard);
  });
}

// This function handles both searching and sorting together
function filterAndSortVideos() {
  // Get the search text in lowercase
  const searchText = searchInput.value.toLowerCase();

  // Make a copy of the original video array after filtering
  let filteredVideos = allVideos.filter((video) => {
    return (
      video.title.toLowerCase().includes(searchText) ||
      video.subject.toLowerCase().includes(searchText)
    );
  });

  // Check selected sort option
  const sortValue = sortSelect.value;

  if (sortValue === "views") {
    // Sort by view count from highest to lowest
    filteredVideos.sort((a, b) => b.views - a.views);
  } else if (sortValue === "rating") {
    // Sort by rating from highest to lowest
    filteredVideos.sort((a, b) => b.rating - a.rating);
  } else if (sortValue === "latest") {
    // Sort by date from newest to oldest
    filteredVideos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Display the final filtered and sorted list
  displayVideos(filteredVideos);
}

// Fetch video data from backend API
fetch("http://localhost:5001/api/videos")
  .then((response) => response.json())
  .then((data) => {
    console.log(data);

    // Store backend data in allVideos
    allVideos = data;

    // Show all videos when page first loads
    displayVideos(allVideos);
  })
  .catch((error) => {
    console.error("Error fetching videos:", error);
  });

// When user types in search box, update the displayed videos
searchInput.addEventListener("input", filterAndSortVideos);

// When user changes sort option, update the displayed videos
sortSelect.addEventListener("change", filterAndSortVideos);