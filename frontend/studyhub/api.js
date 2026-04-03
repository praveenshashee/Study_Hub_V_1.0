(function initializeStudyHubApi() {
  const urlParams = new URLSearchParams(window.location.search);
  const isLocalFile = window.location.protocol === "file:";
  const isSeparateLocalFrontend =
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") &&
    window.location.port &&
    window.location.port !== "5001";
  const configuredBaseUrl =
    urlParams.get("apiBase") ||
    window.localStorage.getItem("studyHubApiBaseUrl");

  const baseUrl = configuredBaseUrl ||
    (isLocalFile || isSeparateLocalFrontend
      ? "http://localhost:5001"
      : window.location.origin);

  window.StudyHubApi = {
    baseUrl,
    buildUrl(path) {
      return `${baseUrl}${path}`;
    }
  };
})();
