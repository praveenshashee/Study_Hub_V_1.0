const subjectPalette = {
  "Database Systems": ["#0f766e", "#34d399"],
  "Operating Systems": ["#c2410c", "#fb923c"],
  "Data Structures": ["#1d4ed8", "#60a5fa"],
  "Computer Networks": ["#be123c", "#fb7185"]
};

export function formatCompactNumber(value) {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

export function formatFullDate(dateString) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(dateString));
}

export function formatRelativeTime(timestamp) {
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

export function buildSubjectGradient(subject) {
  const [start, end] = subjectPalette[subject] || ["#16324f", "#2d6a73"];
  return `linear-gradient(135deg, ${start}, ${end})`;
}

export function getSubjectPalette(subject) {
  return subjectPalette[subject] || ["#16324f", "#2d6a73"];
}
