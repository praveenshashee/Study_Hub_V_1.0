async function request(path, options = {}) {
  const response = await fetch(path, options);
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof payload === "string"
      ? payload
      : payload?.message || "Request failed";

    throw new Error(message);
  }

  return payload;
}

export function fetchVideos() {
  return request("/api/videos");
}

export function createVideo(video) {
  return request("/api/videos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(video)
  });
}

export function updateVideo(videoId, video) {
  return request(`/api/videos/${videoId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(video)
  });
}

export function deleteVideo(videoId) {
  return request(`/api/videos/${videoId}`, {
    method: "DELETE"
  });
}

export function incrementVideoViews(videoId) {
  return request(`/api/videos/${videoId}/view`, {
    method: "PATCH"
  });
}
