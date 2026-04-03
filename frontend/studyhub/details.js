const detailsContainer = document.getElementById("details-container");
const params = new URLSearchParams(window.location.search);
const videoId = params.get("id");

function createInfoRow(label, value, options = {}) {
  const paragraph = document.createElement("p");
  const strong = document.createElement("strong");

  strong.textContent = `${label}: `;
  paragraph.appendChild(strong);
  paragraph.append(value);

  if (options.id) {
    paragraph.id = options.id;
  }

  return paragraph;
}

function createMaterialBlock(url, label) {
  const paragraph = document.createElement("p");

  if (!url || url === "null") {
    const strong = document.createElement("strong");
    strong.textContent = `${label}: `;
    paragraph.appendChild(strong);
    paragraph.append("Not available");
    return paragraph;
  }

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = label;

  paragraph.appendChild(link);
  return paragraph;
}

function updateBookmarkButton(button, bookmarked) {
  button.className = bookmarked ? "bookmark-btn active" : "bookmark-btn";
  button.textContent = bookmarked ? "Bookmarked" : "Bookmark";
}

function showError(message) {
  detailsContainer.innerHTML = "";
  const error = document.createElement("p");
  error.textContent = message;
  detailsContainer.appendChild(error);
}

function renderVideo(video) {
  detailsContainer.innerHTML = "";

  const card = document.createElement("div");
  const title = document.createElement("h2");
  const materialsHeading = document.createElement("h3");
  const actions = document.createElement("div");
  const bookmarkButton = document.createElement("button");
  const editLink = document.createElement("a");
  const deleteButton = document.createElement("button");

  card.className = "video-card";
  title.textContent = video.title;
  materialsHeading.textContent = "Study Materials";
  actions.className = "card-actions detail-actions";

  updateBookmarkButton(
    bookmarkButton,
    window.StudyHubPersonalization.isBookmarked(video.id)
  );

  bookmarkButton.addEventListener("click", () => {
    const result = window.StudyHubPersonalization.toggleBookmark(video.id);
    updateBookmarkButton(bookmarkButton, result.bookmarked);
  });

  editLink.href = `edit-video.html?id=${video.id}`;
  editLink.className = "view-btn edit-btn";
  editLink.textContent = "Edit Video";

  deleteButton.id = "delete-btn";
  deleteButton.className = "delete-btn";
  deleteButton.textContent = "Delete Video";

  card.appendChild(title);
  card.appendChild(createInfoRow("Subject", video.subject));
  card.appendChild(createInfoRow("Description", video.description));
  card.appendChild(createInfoRow("Uploader", video.uploader));
  card.appendChild(createInfoRow("Views", String(video.views), { id: "view-count" }));
  card.appendChild(createInfoRow("Rating", String(video.rating)));
  card.appendChild(createInfoRow("Date", String(video.createdAt)));
  card.appendChild(materialsHeading);
  card.appendChild(createMaterialBlock(video.materials?.slides, "Lecture Slides"));
  card.appendChild(createMaterialBlock(video.materials?.labSheet, "Lab Sheet"));
  card.appendChild(createMaterialBlock(video.materials?.modelPaper, "Model Paper"));

  actions.appendChild(bookmarkButton);
  actions.appendChild(editLink);
  actions.appendChild(deleteButton);
  card.appendChild(actions);

  detailsContainer.appendChild(card);

  deleteButton.addEventListener("click", async () => {
    const confirmed = confirm("Are you sure you want to delete this video?");

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(window.StudyHubApi.buildUrl(`/api/videos/${video.id}`), {
        method: "DELETE"
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete video");
        return;
      }

      window.StudyHubPersonalization.removeVideo(video.id);
      alert("Video deleted successfully!");
      window.location.href = "index.html";
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("Failed to connect to backend");
    }
  });
}

if (!videoId) {
  showError("Missing video id.");
} else {
  fetch(window.StudyHubApi.buildUrl(`/api/videos/${videoId}`))
    .then(async (response) => {
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load video details.");
      }

      return data;
    })
    .then((video) => {
      window.StudyHubPersonalization.markWatched(video);
      renderVideo(video);

      return fetch(window.StudyHubApi.buildUrl(`/api/videos/${videoId}/view`), {
        method: "PATCH"
      });
    })
    .then(async (response) => {
      const data = await response.json();

      if (!response.ok) {
        return;
      }

      const viewCount = document.getElementById("view-count");

      if (viewCount) {
        viewCount.innerHTML = "";
        const strong = document.createElement("strong");
        strong.textContent = "Views: ";
        viewCount.appendChild(strong);
        viewCount.append(String(data.views));
      }
    })
    .catch((error) => {
      console.error("Error loading video details:", error);
      showError(error.message || "Failed to load video details.");
    });
}
