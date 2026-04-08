const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const toValidDate = (value) => {
  const parsedValue = new Date(value);
  return Number.isNaN(parsedValue.getTime()) ? null : parsedValue;
};

export const formatDisplayDate = (value) => {
  const parsedValue = toValidDate(value);
  return parsedValue ? parsedValue.toLocaleDateString() : "No date";
};

export const getTotalViews = (videos) =>
  videos.reduce((total, video) => total + (Number(video.views) || 0), 0);

export const getAverageRating = (videos) => {
  if (videos.length === 0) {
    return 0;
  }

  const ratingTotal = videos.reduce(
    (total, video) => total + (Number(video.rating) || 0),
    0
  );

  return ratingTotal / videos.length;
};

export const countCreatedWithin = (items, dateKey, days) => {
  const now = Date.now();

  return items.filter((item) => {
    const timestamp = toValidDate(item?.[dateKey])?.getTime();
    return timestamp && now - timestamp <= days * DAY_IN_MS;
  }).length;
};

export const countDeadlinesWithin = (internships, days) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineLimit = today.getTime() + days * DAY_IN_MS;

  return internships.filter((internship) => {
    const deadline = toValidDate(internship.deadline)?.getTime();
    return deadline && deadline >= today.getTime() && deadline <= deadlineLimit;
  }).length;
};

export const getMostRepresentedSubject = (videos) => {
  const subjectCounts = new Map();

  videos.forEach((video) => {
    if (!video.subject) {
      return;
    }

    subjectCounts.set(video.subject, (subjectCounts.get(video.subject) || 0) + 1);
  });

  return [...subjectCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0]
    || "No subject data";
};
