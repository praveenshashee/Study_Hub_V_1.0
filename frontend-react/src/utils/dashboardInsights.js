const DAY_IN_MS = 1000 * 60 * 60 * 24;

const toValidDate = (value) => {
  const parsedValue = new Date(value);
  return Number.isNaN(parsedValue.getTime()) ? null : parsedValue;
};

const getTodayStart = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const createVideoMap = (videos) =>
  new Map(videos.map((video) => [Number(video.id), video]));

export const getLatestVideo = (videos) =>
  [...videos]
    .sort((left, right) => {
      const leftDate = toValidDate(left.createdAt)?.getTime() || 0;
      const rightDate = toValidDate(right.createdAt)?.getTime() || 0;
      return rightDate - leftDate;
    })[0] || null;

export const getUpcomingInternships = (internships, limit = 3) => {
  const today = getTodayStart();

  const rankedInternships = internships
    .filter((internship) => toValidDate(internship.deadline))
    .sort((left, right) => {
      const leftDate = toValidDate(left.deadline)?.getTime() || 0;
      const rightDate = toValidDate(right.deadline)?.getTime() || 0;
      return leftDate - rightDate;
    });

  const upcomingInternships = rankedInternships.filter((internship) => {
    const deadline = toValidDate(internship.deadline);
    return deadline && deadline >= today;
  });

  return (upcomingInternships.length > 0
    ? upcomingInternships
    : rankedInternships
  ).slice(0, limit);
};

export const formatRelativeDeadline = (deadline) => {
  const parsedDeadline = toValidDate(deadline);

  if (!parsedDeadline) {
    return "No deadline";
  }

  const today = getTodayStart();
  const target = new Date(parsedDeadline);
  target.setHours(0, 0, 0, 0);

  const differenceInDays = Math.round(
    (target.getTime() - today.getTime()) / DAY_IN_MS
  );

  if (differenceInDays < 0) {
    return `Closed ${Math.abs(differenceInDays)} day${
      Math.abs(differenceInDays) === 1 ? "" : "s"
    } ago`;
  }

  if (differenceInDays === 0) {
    return "Due today";
  }

  if (differenceInDays === 1) {
    return "1 day left";
  }

  return `${differenceInDays} days left`;
};

export const formatRelativeActivity = (timestamp) => {
  const parsedTimestamp = Number(timestamp);

  if (!Number.isFinite(parsedTimestamp) || parsedTimestamp <= 0) {
    return "No activity yet";
  }

  const today = getTodayStart();
  const target = new Date(parsedTimestamp);
  target.setHours(0, 0, 0, 0);

  const differenceInDays = Math.round(
    (today.getTime() - target.getTime()) / DAY_IN_MS
  );

  if (differenceInDays <= 0) {
    return "Today";
  }

  if (differenceInDays === 1) {
    return "Yesterday";
  }

  return `${differenceInDays} days ago`;
};

export const getActivitySnapshot = ({ bookmarks, recentViews }) => {
  const now = Date.now();
  const weekAgo = now - DAY_IN_MS * 7;

  const recentViewsThisWeek = recentViews.filter(
    (entry) => Number(entry.viewedAt) >= weekAgo
  ).length;
  const savesThisWeek = bookmarks.filter(
    (entry) => Number(entry.savedAt) >= weekAgo
  ).length;
  const activeDays = new Set(
    recentViews
      .map((entry) => {
        const timestamp = Number(entry.viewedAt);

        if (!Number.isFinite(timestamp)) {
          return null;
        }

        return new Date(timestamp).toDateString();
      })
      .filter(Boolean)
  ).size;
  const lastActivityTimestamp = Math.max(
    Number(recentViews[0]?.viewedAt) || 0,
    Number(bookmarks[0]?.savedAt) || 0
  );
  const engagementScore = recentViewsThisWeek * 3 + savesThisWeek * 2;

  let engagementLabel = "Starting";

  if (engagementScore >= 10) {
    engagementLabel = "High";
  } else if (engagementScore >= 4) {
    engagementLabel = "Steady";
  }

  return {
    activeDays,
    engagementLabel,
    engagementScore,
    lastActiveLabel: formatRelativeActivity(lastActivityTimestamp),
    recentViewsThisWeek,
    savesThisWeek
  };
};

export const getSubjectMomentum = ({
  videos,
  bookmarks,
  recentViews,
  limit = 4
}) => {
  const videosById = createVideoMap(videos);
  const subjectLibraryCounts = new Map();
  const subjectEngagement = new Map();

  videos.forEach((video) => {
    if (!video.subject) {
      return;
    }

    subjectLibraryCounts.set(
      video.subject,
      (subjectLibraryCounts.get(video.subject) || 0) + 1
    );
  });

  recentViews.forEach((entry) => {
    const video = videosById.get(entry.id);

    if (video?.subject) {
      subjectEngagement.set(
        video.subject,
        (subjectEngagement.get(video.subject) || 0) + 3
      );
    }
  });

  bookmarks.forEach((entry) => {
    const video = videosById.get(entry.id);

    if (video?.subject) {
      subjectEngagement.set(
        video.subject,
        (subjectEngagement.get(video.subject) || 0) + 2
      );
    }
  });

  const rankedSubjects = [...subjectLibraryCounts.entries()]
    .map(([subject, libraryCount]) => ({
      subject,
      libraryCount,
      engagementScore: subjectEngagement.get(subject) || 0
    }))
    .sort((left, right) => {
      if (right.engagementScore !== left.engagementScore) {
        return right.engagementScore - left.engagementScore;
      }

      return right.libraryCount - left.libraryCount;
    })
    .slice(0, limit);

  const maxScore = Math.max(
    ...rankedSubjects.map((item) =>
      item.engagementScore > 0 ? item.engagementScore : item.libraryCount
    ),
    1
  );

  return rankedSubjects.map((item) => ({
    ...item,
    progress:
      ((item.engagementScore > 0 ? item.engagementScore : item.libraryCount) /
        maxScore) *
      100
  }));
};

export const getDashboardNarrative = ({
  preferredSubject,
  recentVideos,
  savedVideos,
  upcomingInternships,
  latestVideo
}) => {
  if (recentVideos.length > 0 && preferredSubject !== "Still learning your preferences") {
    return `You are building consistent momentum in ${preferredSubject}. Continue from your recent videos or branch into fresh recommendations.`;
  }

  if (savedVideos.length > 0) {
    return "Your saved collection is ready for revision. Use the dashboard to move from saved ideas into active study sessions.";
  }

  if (upcomingInternships.length > 0) {
    return "Your dashboard now combines study content with career opportunities, so you can move from learning to application in one place.";
  }

  if (latestVideo?.title) {
    return `The latest addition to the library is "${latestVideo.title}". Start there to refresh the dashboard with live activity.`;
  }

  return "Browse the library, save a few resources, and watch a couple of videos to unlock stronger recommendations and focus insights.";
};
