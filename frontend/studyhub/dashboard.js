const heroContainer = document.getElementById("dashboard-hero");
const subjectChipRow = document.getElementById("subject-chip-row");
const continueWatchingTrack = document.getElementById("continue-watching-track");
const watchLaterTrack = document.getElementById("watch-later-track");
const recommendedTrack = document.getElementById("recommended-track");
const popularTrack = document.getElementById("popular-track");
const insightsContainer = document.getElementById("dashboard-insights");
const activityTimeline = document.getElementById("activity-timeline");
const recommendationSubtitle = document.getElementById("recommendation-subtitle");

let allVideos = [];
let activeSubject = "All";

function formatViews(views) {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(views);
}

function formatRelativeTime(timestamp) {
  const difference = timestamp - Date.now();
  const minutes = Math.round(difference / (1000 * 60));
  const hours = Math.round(difference / (1000 * 60 * 60));
  const days = Math.round(difference / (1000 * 60 * 60 * 24));
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, "minute");
  }

  if (Math.abs(hours) < 24) {
    return formatter.format(hours, "hour");
  }

  return formatter.format(days, "day");
}

function formatSubjectSummary(subjects) {
  if (subjects.length === 0) {
    return "Not enough activity yet";
  }

  if (subjects.length <= 2) {
    return subjects.join(", ");
  }

  return `${subjects.slice(0, 2).join(", ")} + ${subjects.length - 2} more`;
}

function getSubjectPalette(subject) {
  const paletteMap = {
    "Database Systems": ["#0f766e", "#14b8a6"],
    "Operating Systems": ["#b45309", "#f59e0b"],
    "Data Structures": ["#1d4ed8", "#60a5fa"],
    "Computer Networks": ["#be123c", "#fb7185"]
  };

  return paletteMap[subject] || ["#334155", "#94a3b8"];
}

function filterBySubject(videos) {
  if (activeSubject === "All") {
    return videos;
  }

  return videos.filter((video) => video.subject === activeSubject);
}

function updateBookmarkButton(button, bookmarked) {
  button.className = bookmarked ? "bookmark-btn active" : "bookmark-btn";
  button.textContent = bookmarked ? "Saved" : "Save";
}

function createEmptyShelf(message) {
  const emptyCard = document.createElement("div");
  emptyCard.className = "empty-shelf";
  emptyCard.textContent = message;
  return emptyCard;
}

function createThumbnail(video, options = {}) {
  const thumbnail = document.createElement("div");
  const subjectTag = document.createElement("span");
  const metricTag = document.createElement("span");
  const titleAccent = document.createElement("strong");
  const [fromColor, toColor] = getSubjectPalette(video.subject);

  thumbnail.className = options.hero ? "hero-thumbnail" : "shelf-thumbnail";
  thumbnail.style.setProperty("--thumb-from", fromColor);
  thumbnail.style.setProperty("--thumb-to", toColor);

  subjectTag.className = "thumb-chip";
  subjectTag.textContent = video.subject;

  metricTag.className = "thumb-chip metric";
  metricTag.textContent = `${formatViews(video.views)} views`;

  titleAccent.textContent = video.title;

  thumbnail.appendChild(subjectTag);
  thumbnail.appendChild(metricTag);
  thumbnail.appendChild(titleAccent);

  if (typeof options.progress === "number") {
    const progressTrack = document.createElement("div");
    const progressBar = document.createElement("span");

    progressTrack.className = "thumb-progress-track";
    progressBar.className = "thumb-progress-bar";
    progressBar.style.width = `${Math.min(options.progress, 100)}%`;

    progressTrack.appendChild(progressBar);
    thumbnail.appendChild(progressTrack);
  }

  return thumbnail;
}

function createShelfCard(video, options = {}) {
  const card = document.createElement("article");
  const thumbnail = createThumbnail(video, { progress: options.progress });
  const content = document.createElement("div");
  const title = document.createElement("h3");
  const meta = document.createElement("p");
  const extra = document.createElement("p");
  const actions = document.createElement("div");
  const openLink = document.createElement("a");
  const bookmarkButton = document.createElement("button");

  card.className = "shelf-card";
  card.style.setProperty("--enter-delay", `${options.index ? options.index * 70 : 0}ms`);
  content.className = "shelf-card-body";
  actions.className = "shelf-card-actions";

  title.textContent = video.title;
  meta.textContent = `${video.subject} - ${formatViews(video.views)} views - ${video.rating.toFixed(1)} rating`;

  if (typeof options.progress === "number") {
    extra.textContent = `${options.progress}% completed - ${formatRelativeTime(options.watchedAt)}`;
  } else if (options.extraText) {
    extra.textContent = options.extraText;
  } else {
    extra.textContent = `Uploaded on ${video.createdAt}`;
  }

  openLink.href = `video-details.html?id=${video.id}`;
  openLink.className = "view-btn";
  openLink.textContent = options.actionLabel || "Open";

  updateBookmarkButton(
    bookmarkButton,
    window.StudyHubPersonalization.isBookmarked(video.id)
  );

  bookmarkButton.addEventListener("click", () => {
    const result = window.StudyHubPersonalization.toggleBookmark(video.id);
    updateBookmarkButton(bookmarkButton, result.bookmarked);
    renderDashboard();
  });

  content.appendChild(title);
  content.appendChild(meta);
  content.appendChild(extra);

  actions.appendChild(openLink);
  actions.appendChild(bookmarkButton);

  card.appendChild(thumbnail);
  card.appendChild(content);
  card.appendChild(actions);

  return card;
}

function renderHero(data) {
  heroContainer.innerHTML = "";

  const heroVideo = filterBySubject(data.heroVideo ? [data.heroVideo] : [])[0] ||
    filterBySubject(data.recommended)[0] ||
    filterBySubject(data.popular)[0] ||
    data.heroVideo;

  if (!heroVideo) {
    heroContainer.appendChild(createEmptyShelf("No featured video available yet."));
    return;
  }

  const heroPanel = document.createElement("section");
  const heroText = document.createElement("div");
  const kicker = document.createElement("span");
  const title = document.createElement("h2");
  const description = document.createElement("p");
  const statRow = document.createElement("div");
  const actionRow = document.createElement("div");
  const resumeLink = document.createElement("a");
  const bookmarkButton = document.createElement("button");
  const heroRecent = data.recentlyWatched.find((video) => video.id === heroVideo.id);

  heroPanel.className = "hero-panel";
  heroText.className = "hero-copy";
  kicker.className = "hero-kicker";
  statRow.className = "hero-stat-row";
  actionRow.className = "hero-action-row";

  kicker.textContent = heroRecent ? "Continue learning" : "Recommended next";
  title.textContent = heroVideo.title;
  description.textContent = heroVideo.description;

  [
    heroVideo.subject,
    `${formatViews(heroVideo.views)} views`,
    `${heroVideo.rating.toFixed(1)} rating`,
    heroRecent ? `${heroRecent.progress}% completed` : `Added ${heroVideo.createdAt}`
  ].forEach((item) => {
    const pill = document.createElement("span");
    pill.className = "hero-stat-pill";
    pill.textContent = item;
    statRow.appendChild(pill);
  });

  resumeLink.href = `video-details.html?id=${heroVideo.id}`;
  resumeLink.className = "hero-primary";
  resumeLink.textContent = heroRecent ? "Resume Watching" : "Start Watching";

  updateBookmarkButton(
    bookmarkButton,
    window.StudyHubPersonalization.isBookmarked(heroVideo.id)
  );

  bookmarkButton.addEventListener("click", () => {
    const result = window.StudyHubPersonalization.toggleBookmark(heroVideo.id);
    updateBookmarkButton(bookmarkButton, result.bookmarked);
    renderDashboard();
  });

  actionRow.appendChild(resumeLink);
  actionRow.appendChild(bookmarkButton);

  heroText.appendChild(kicker);
  heroText.appendChild(title);
  heroText.appendChild(description);
  heroText.appendChild(statRow);
  heroText.appendChild(actionRow);

  heroPanel.appendChild(heroText);
  heroPanel.appendChild(createThumbnail(heroVideo, {
    hero: true,
    progress: heroRecent?.progress
  }));

  heroContainer.appendChild(heroPanel);
}

function renderChips(data) {
  subjectChipRow.innerHTML = "";

  const subjectList = [
    "All",
    ...new Set([
      ...data.favoriteSubjects,
      ...allVideos.map((video) => video.subject)
    ])
  ];

  subjectList.forEach((subject) => {
    const chip = document.createElement("button");
    chip.className = subject === activeSubject ? "subject-chip active" : "subject-chip";
    chip.style.setProperty("--enter-delay", `${subjectChipRow.children.length * 50}ms`);
    chip.textContent = subject;
    chip.addEventListener("click", () => {
      activeSubject = subject;
      renderDashboard();
    });
    subjectChipRow.appendChild(chip);
  });
}

function renderInsights(data) {
  insightsContainer.innerHTML = "";

  const insightItems = [
    {
      label: "Recently watched",
      value: String(data.stats.watchedCount)
    },
    {
      label: "Saved videos",
      value: String(data.stats.savedCount)
    },
    {
      label: "Top subjects",
      value: formatSubjectSummary(data.favoriteSubjects)
    },
    {
      label: "Feed filter",
      value: activeSubject === "All" ? "Showing all subjects" : `Focused on ${activeSubject}`
    }
  ];

  insightItems.forEach((item, index) => {
    const row = document.createElement("div");
    const label = document.createElement("span");
    const value = document.createElement("strong");

    row.className = "insight-row";
    row.style.setProperty("--enter-delay", `${index * 60}ms`);
    label.textContent = item.label;
    value.textContent = item.value;

    row.appendChild(label);
    row.appendChild(value);
    insightsContainer.appendChild(row);
  });
}

function renderActivityTimeline(data) {
  activityTimeline.innerHTML = "";

  if (data.recentlyWatched.length === 0) {
    activityTimeline.appendChild(createEmptyShelf("Your watch history will appear here."));
    return;
  }

  data.recentlyWatched.slice(0, 4).forEach((video, index) => {
    const item = document.createElement("a");
    const title = document.createElement("strong");
    const meta = document.createElement("span");

    item.className = "activity-item";
    item.style.setProperty("--enter-delay", `${index * 70}ms`);
    item.href = `video-details.html?id=${video.id}`;
    title.textContent = video.title;
    meta.textContent = `${formatRelativeTime(video.watchedAt)} - ${video.progress}% completed`;

    item.appendChild(title);
    item.appendChild(meta);
    activityTimeline.appendChild(item);
  });
}

function renderShelf(container, videos, emptyMessage, options = {}) {
  container.innerHTML = "";

  if (videos.length === 0) {
    container.appendChild(createEmptyShelf(emptyMessage));
    return;
  }

  videos.forEach((video, index) => {
    const cardOptions = options.resolveOptions ? options.resolveOptions(video) : {};
    container.appendChild(createShelfCard(video, {
      ...cardOptions,
      index
    }));
  });
}

function renderDashboard() {
  const data = window.StudyHubPersonalization.getDashboardData(allVideos);
  const filteredRecent = filterBySubject(data.recentlyWatched);
  const filteredBookmarks = filterBySubject(data.bookmarkedVideos);
  const filteredRecommended = filterBySubject(data.recommended);
  const filteredPopular = filterBySubject(data.popular);
  const topReason = data.favoriteSubjects[0];

  recommendationSubtitle.textContent = topReason
    ? `Because you keep returning to ${topReason}.`
    : "Generated from your recent study behavior.";

  renderHero(data);
  renderChips(data);
  renderInsights(data);
  renderActivityTimeline(data);

  renderShelf(
    continueWatchingTrack,
    filteredRecent,
    "Open a few videos and your resume shelf will appear here.",
    {
      resolveOptions(video) {
        return {
          progress: video.progress,
          watchedAt: video.watchedAt,
          actionLabel: "Resume"
        };
      }
    }
  );

  renderShelf(
    watchLaterTrack,
    filteredBookmarks,
    "Save videos from the home page or player to build your watch-later list.",
    {
      resolveOptions(video) {
        return {
          extraText: `Ready to watch - ${video.subject}`
        };
      }
    }
  );

  renderShelf(
    recommendedTrack,
    filteredRecommended,
    "Your recommendation shelf needs more activity in this subject.",
    {
      resolveOptions(video) {
        return {
          extraText: `Suggested because of your ${video.subject} activity`
        };
      }
    }
  );

  renderShelf(
    popularTrack,
    filteredPopular,
    "No popular videos match this filter right now.",
    {
      resolveOptions(video) {
        return {
          extraText: `${formatViews(video.views)} views across Study Hub`
        };
      }
    }
  );
}

fetch(window.StudyHubApi.buildUrl("/api/videos"))
  .then(async (response) => {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load dashboard.");
    }

    return data;
  })
  .then((data) => {
    allVideos = data;
    renderDashboard();
  })
  .catch((error) => {
    console.error("Error loading dashboard:", error);
    heroContainer.innerHTML = "";
    heroContainer.appendChild(createEmptyShelf(error.message || "Failed to load dashboard."));
  });
