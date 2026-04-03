let allVideos = [];

const videoContainer = document.getElementById("video-container");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");

function createInfoRow(label, value) {
  const paragraph = document.createElement("p");
  const strong = document.createElement("strong");

  strong.textContent = `${label}: `;
  paragraph.appendChild(strong);
  paragraph.append(value);

  return paragraph;
}

function updateBookmarkButton(button, bookmarked) {
  button.className = bookmarked ? "bookmark-btn active" : "bookmark-btn";
  button.textContent = bookmarked ? "Bookmarked" : "Bookmark";
}

function createVideoCard(video) {
  const videoCard = document.createElement("div");
  const header = document.createElement("div");
  const title = document.createElement("h3");
  const actions = document.createElement("div");
  const viewLink = document.createElement("a");
  const bookmarkButton = document.createElement("button");

  videoCard.className = "video-card";
  header.className = "card-header";
  actions.className = "card-actions";

  title.textContent = video.title;

  viewLink.href = `video-details.html?id=${video.id}`;
  viewLink.className = "view-btn";
  viewLink.textContent = "View More";

  updateBookmarkButton(
    bookmarkButton,
    window.StudyHubPersonalization.isBookmarked(video.id)
  );

  bookmarkButton.addEventListener("click", () => {
    const result = window.StudyHubPersonalization.toggleBookmark(video.id);
    updateBookmarkButton(bookmarkButton, result.bookmarked);
  });

  header.appendChild(title);

  videoCard.appendChild(header);
  videoCard.appendChild(createInfoRow("Subject", video.subject));
  videoCard.appendChild(createInfoRow("Views", String(video.views)));
  videoCard.appendChild(createInfoRow("Rating", String(video.rating)));
  videoCard.appendChild(createInfoRow("Date", String(video.createdAt)));

  actions.appendChild(viewLink);
  actions.appendChild(bookmarkButton);
  videoCard.appendChild(actions);

  return videoCard;
}

function displayVideos(videos) {
  videoContainer.innerHTML = "";

  if (videos.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.textContent = "No videos found.";
    videoContainer.appendChild(emptyState);
    return;
  }

  videos.forEach((video) => {
    videoContainer.appendChild(createVideoCard(video));
  });
}

function renderLoadError(message) {
  videoContainer.innerHTML = "";
  const error = document.createElement("p");
  error.textContent = message;
  videoContainer.appendChild(error);
}

function filterAndSortVideos() {
  const searchText = searchInput.value.toLowerCase();

  const filteredVideos = allVideos.filter((video) => (
    video.title.toLowerCase().includes(searchText) ||
    video.subject.toLowerCase().includes(searchText)
  ));

  const sortValue = sortSelect.value;

  if (sortValue === "views") {
    filteredVideos.sort((a, b) => b.views - a.views);
  } else if (sortValue === "rating") {
    filteredVideos.sort((a, b) => b.rating - a.rating);
  } else if (sortValue === "latest") {
    filteredVideos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  displayVideos(filteredVideos);
}

fetch(window.StudyHubApi.buildUrl("/api/videos"))
  .then(async (response) => {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load videos.");
    }

    return data;
  })
  .then((data) => {
    allVideos = data;
    displayVideos(allVideos);
  })
  .catch((error) => {
    console.error("Error fetching videos:", error);
    renderLoadError(error.message || "Failed to load videos.");
  });

searchInput.addEventListener("input", filterAndSortVideos);
sortSelect.addEventListener("change", filterAndSortVideos);
