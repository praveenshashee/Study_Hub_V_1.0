import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";

const recentViewTracker = {};

function formatCommentDate(value) {
  if (!value) {
    return "Just now";
  }

  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function wasCommentEdited(comment) {
  if (!comment?.createdAt || !comment?.updatedAt) {
    return false;
  }

  return Math.abs(new Date(comment.updatedAt) - new Date(comment.createdAt)) > 1000;
}

function VideoDetails({ currentUser, authLoading }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [userRating, setUserRating] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingMessage, setRatingMessage] = useState("");

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replySubmittingId, setReplySubmittingId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editDrafts, setEditDrafts] = useState({});
  const [commentActionId, setCommentActionId] = useState(null);

  useEffect(() => {
    loadVideo();
  }, [id]);

  useEffect(() => {
    if (!authLoading && currentUser?.role === "user") {
      loadUserRating();
    } else {
      setUserRating(null);
    }
  }, [id, currentUser, authLoading]);

  useEffect(() => {
    if (!authLoading && currentUser) {
      loadComments();
    } else {
      setComments([]);
    }
  }, [id, currentUser, authLoading]);

  const loadVideo = async () => {
    setLoading(true);
    setError("");

    const now = Date.now();
    const lastViewTime = recentViewTracker[id];

    try {
      let response;

      // Skip only very recent duplicate calls (like React StrictMode dev remount)
      if (lastViewTime && now - lastViewTime < 500) {
        response = await api.get(`/api/videos/${id}`);
      } else {
        recentViewTracker[id] = now;
        response = await api.patch(`/api/videos/${id}/view`);
      }

      setVideo(response.data);
    } catch (err) {
      console.error("Failed to load video details:", err);
      setError("Failed to load video details");
    } finally {
      setLoading(false);
    }
  };

  const loadUserRating = async () => {
    try {
      const response = await api.get(`/api/videos/${id}/my-rating`);
      setUserRating(response.data.ratingValue);
    } catch (err) {
      console.error("Failed to load user rating:", err);
      setUserRating(null);
    }
  };

  const loadComments = async () => {
    setCommentsLoading(true);
    setCommentMessage("");

    try {
      const response = await api.get(`/api/videos/${id}/comments`);
      setComments(response.data.comments || []);
    } catch (err) {
      console.error("Failed to load comments:", err);
      setCommentMessage(err.response?.data?.message || "Failed to load comments");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleRateVideo = async (selectedRating) => {
    setRatingLoading(true);
    setRatingMessage("");

    try {
      const response = await api.post(`/api/videos/${id}/rate`, {
        ratingValue: selectedRating
      });

      setUserRating(selectedRating);
      setVideo(response.data.video);
      setRatingMessage("Rating submitted successfully");
    } catch (err) {
      console.error("Failed to submit rating:", err);
      setRatingMessage(err.response?.data?.message || "Failed to submit rating");
    } finally {
      setRatingLoading(false);
    }
  };

  const handleSubmitComment = async (event) => {
    event.preventDefault();
    setCommentMessage("");

    const trimmedComment = commentText.trim();

    if (!trimmedComment) {
      setCommentMessage("Comment cannot be empty");
      return;
    }

    setCommentSubmitting(true);

    try {
      const response = await api.post(`/api/videos/${id}/comments`, {
        body: trimmedComment
      });

      setComments(response.data.comments || []);
      setCommentText("");
      setCommentMessage("Comment posted");
    } catch (err) {
      console.error("Failed to post comment:", err);
      setCommentMessage(err.response?.data?.message || "Failed to post comment");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleSubmitReply = async (event, commentId) => {
    event.preventDefault();
    setCommentMessage("");

    const trimmedReply = (replyDrafts[commentId] || "").trim();

    if (!trimmedReply) {
      setCommentMessage("Reply cannot be empty");
      return;
    }

    setReplySubmittingId(commentId);

    try {
      const response = await api.post(`/api/videos/${id}/comments/${commentId}/replies`, {
        body: trimmedReply
      });

      setComments(response.data.comments || []);
      setReplyDrafts((prev) => ({
        ...prev,
        [commentId]: ""
      }));
      setCommentMessage("Reply posted");
    } catch (err) {
      console.error("Failed to post reply:", err);
      setCommentMessage(err.response?.data?.message || "Failed to post reply");
    } finally {
      setReplySubmittingId(null);
    }
  };

  const handleStartEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditDrafts((prev) => ({
      ...prev,
      [comment.id]: comment.body
    }));
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
  };

  const handleSaveCommentEdit = async (event, commentId) => {
    event.preventDefault();
    setCommentMessage("");

    const trimmedEdit = (editDrafts[commentId] || "").trim();

    if (!trimmedEdit) {
      setCommentMessage("Comment cannot be empty");
      return;
    }

    setCommentActionId(commentId);

    try {
      const response = await api.put(`/api/videos/${id}/comments/${commentId}`, {
        body: trimmedEdit
      });

      setComments(response.data.comments || []);
      setEditingCommentId(null);
      setCommentMessage("Comment updated");
    } catch (err) {
      console.error("Failed to update comment:", err);
      setCommentMessage(err.response?.data?.message || "Failed to update comment");
    } finally {
      setCommentActionId(null);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmDelete = window.confirm("Delete this comment?");

    if (!confirmDelete) {
      return;
    }

    setCommentActionId(commentId);
    setCommentMessage("");

    try {
      const response = await api.delete(`/api/videos/${id}/comments/${commentId}`);
      setComments(response.data.comments || []);
      setCommentMessage("Comment deleted");
    } catch (err) {
      console.error("Failed to delete comment:", err);
      setCommentMessage(err.response?.data?.message || "Failed to delete comment");
    } finally {
      setCommentActionId(null);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this video?");

    if (!confirmDelete) return;

    try {
      await api.delete(`/api/videos/${id}`);
      delete recentViewTracker[id];
      alert("Video deleted successfully");
      navigate("/");
    } catch (err) {
      console.error("Failed to delete video:", err);
      alert("Failed to delete video");
    }
  };

  if (loading) {
    return <p className="page-message">Loading video details...</p>;
  }

  if (error) {
    return <p className="page-message">{error}</p>;
  }

  if (!video) {
    return <p className="page-message">Video not found</p>;
  }

  return (
    <div className="details-container">
      <Link to="/home" className="back-link floating-back-link">{"<- Back to Home"}</Link>

      <h1>{video.title}</h1>
      <p><strong>Subject:</strong> {video.subject}</p>
      <p><strong>Description:</strong> {video.description}</p>
      <p><strong>Uploader:</strong> {video.uploader}</p>
      <p><strong>Views:</strong> {video.views}</p>
      <p><strong>Rating:</strong> {video.rating}</p>
      <p><strong>Created At:</strong> {video.createdAt}</p>

      <div className="video-watch-grid">
        <div className="video-player-section">
          <h2>Video Preview</h2>

          <video
            className="video-player"
            controls
            poster={video.thumbnailUrl}
          >
            <source src={video.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <section className="comments-section">
          <div className="comments-header">
            <div>
              <span>Discussion</span>
              <h2>Comments</h2>
            </div>
            <strong>{comments.length}</strong>
          </div>

          {!authLoading && !currentUser && (
            <div className="comments-login-card">
              <p>Login to read and join the video discussion.</p>
              <Link to="/login" className="material-link">
                Login
              </Link>
            </div>
          )}

          {!authLoading && currentUser && (
            <>
              {currentUser?.role !== "admin" ? (
                <form className="comment-form" onSubmit={handleSubmitComment}>
                  <textarea
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder="Share your question or thought about this video..."
                    maxLength={1000}
                  />
                  <div className="comment-form-footer">
                    <span>{commentText.trim().length}/1000</span>
                    <button type="submit" disabled={commentSubmitting}>
                      {commentSubmitting ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="admin-comment-note">
                  <strong>Admin reply mode</strong>
                  <p>Reply to learner comments below instead of starting a new thread.</p>
                </div>
              )}

              {commentMessage && (
                <p
                  className={
                    commentMessage.toLowerCase().includes("posted")
                      || commentMessage.toLowerCase().includes("updated")
                      || commentMessage.toLowerCase().includes("deleted")
                      ? "success-text comment-feedback"
                      : "error-text comment-feedback"
                  }
                >
                  {commentMessage}
                </p>
              )}

              {commentsLoading && <p className="page-message comment-page-message">Loading comments...</p>}

              {!commentsLoading && comments.length === 0 && (
                <div className="comments-empty-state">
                  <h3>No comments yet</h3>
                  <p>Start the discussion for this lesson.</p>
                </div>
              )}

              {!commentsLoading && comments.length > 0 && (
                <div className="comments-list">
                  {comments.map((comment) => (
                    <article className="comment-card" key={comment.id}>
                      <div className="comment-card-header">
                        <div className="comment-meta">
                          <div className="comment-avatar">
                            {comment.author?.fullName?.slice(0, 2).toUpperCase() || "US"}
                          </div>
                          <div>
                            <strong>{comment.author?.fullName || "Study Hub User"}</strong>
                            <span>
                              {comment.author?.role || "user"} - {formatCommentDate(comment.createdAt)}
                              {wasCommentEdited(comment) ? " - edited" : ""}
                            </span>
                          </div>
                        </div>

                        {(comment.canEdit || comment.canDelete) && (
                          <div className="comment-action-row">
                            {comment.canEdit && (
                              <button
                                type="button"
                                className="comment-icon-btn"
                                onClick={() => handleStartEditComment(comment)}
                                disabled={commentActionId === comment.id}
                                aria-label="Edit comment"
                                title="Edit comment"
                              >
                                ✎
                              </button>
                            )}
                            {comment.canDelete && (
                              <button
                                type="button"
                                className="comment-icon-btn danger"
                                onClick={() => handleDeleteComment(comment.id)}
                                disabled={commentActionId === comment.id}
                                aria-label="Delete comment"
                                title="Delete comment"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {editingCommentId === comment.id ? (
                        <form
                          className="comment-edit-form"
                          onSubmit={(event) => handleSaveCommentEdit(event, comment.id)}
                        >
                          <textarea
                            value={editDrafts[comment.id] || ""}
                            onChange={(event) =>
                              setEditDrafts((prev) => ({
                                ...prev,
                                [comment.id]: event.target.value
                              }))
                            }
                            maxLength={1000}
                          />
                          <div className="comment-edit-actions">
                            <button type="submit" disabled={commentActionId === comment.id}>
                              Save
                            </button>
                            <button type="button" onClick={handleCancelEditComment}>
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <p>{comment.body}</p>
                      )}

                      {comment.replies?.length > 0 && (
                        <div className="comment-replies">
                          {comment.replies.map((reply) => (
                            <article className="comment-reply-card" key={reply.id}>
                              <div className="comment-card-header">
                                <div className="comment-meta">
                                  <div className="comment-avatar admin-comment-avatar">
                                    {reply.author?.fullName?.slice(0, 2).toUpperCase() || "AD"}
                                  </div>
                                  <div>
                                    <strong>{reply.author?.fullName || "Admin"}</strong>
                                    <span>
                                      Admin reply - {formatCommentDate(reply.createdAt)}
                                      {wasCommentEdited(reply) ? " - edited" : ""}
                                    </span>
                                  </div>
                                </div>

                                {(reply.canEdit || reply.canDelete) && (
                                  <div className="comment-action-row">
                                    {reply.canEdit && (
                                      <button
                                        type="button"
                                        className="comment-icon-btn"
                                        onClick={() => handleStartEditComment(reply)}
                                        disabled={commentActionId === reply.id}
                                        aria-label="Edit reply"
                                        title="Edit reply"
                                      >
                                        ✎
                                      </button>
                                    )}
                                    {reply.canDelete && (
                                      <button
                                        type="button"
                                        className="comment-icon-btn danger"
                                        onClick={() => handleDeleteComment(reply.id)}
                                        disabled={commentActionId === reply.id}
                                        aria-label="Delete reply"
                                        title="Delete reply"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>

                              {editingCommentId === reply.id ? (
                                <form
                                  className="comment-edit-form"
                                  onSubmit={(event) => handleSaveCommentEdit(event, reply.id)}
                                >
                                  <textarea
                                    value={editDrafts[reply.id] || ""}
                                    onChange={(event) =>
                                      setEditDrafts((prev) => ({
                                        ...prev,
                                        [reply.id]: event.target.value
                                      }))
                                    }
                                    maxLength={1000}
                                  />
                                  <div className="comment-edit-actions">
                                    <button type="submit" disabled={commentActionId === reply.id}>
                                      Save
                                    </button>
                                    <button type="button" onClick={handleCancelEditComment}>
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <p>{reply.body}</p>
                              )}
                            </article>
                          ))}
                        </div>
                      )}

                      {currentUser?.role === "admin" && comment.replies?.length === 0 && (
                        <form
                          className="comment-reply-form"
                          onSubmit={(event) => handleSubmitReply(event, comment.id)}
                        >
                          <textarea
                            value={replyDrafts[comment.id] || ""}
                            onChange={(event) =>
                              setReplyDrafts((prev) => ({
                                ...prev,
                                [comment.id]: event.target.value
                              }))
                            }
                            placeholder="Reply as admin..."
                            maxLength={1000}
                          />
                          <button type="submit" disabled={replySubmittingId === comment.id}>
                            {replySubmittingId === comment.id ? "Replying..." : "Reply"}
                          </button>
                        </form>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {!authLoading && currentUser?.role === "user" && (
        <div className="rating-section">
          <h2>Rate This Video</h2>
          <p className="section-help">
            Click a star to rate this video from 1 to 5.
          </p>

          <div className="star-rating-row">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-btn ${userRating >= star ? "active" : ""}`}
                onClick={() => handleRateVideo(star)}
                disabled={ratingLoading}
              >
                {"*"}
              </button>
            ))}
          </div>

          <p className="user-rating-text">
            Your rating: {userRating ? `${userRating}/5` : "Not rated yet"}
          </p>

          {ratingMessage && (
            <p
              className={
                ratingMessage.toLowerCase().includes("success")
                  ? "success-text"
                  : "error-text"
              }
            >
              {ratingMessage}
            </p>
          )}
        </div>
      )}

      <div className="materials-section">
        <h2>Materials</h2>
        <ul>
          <li>
            {video.materials?.labSheet ? (
              <a
                href={video.materials.labSheet}
                target="_blank"
                rel="noreferrer"
                className="material-link"
              >
                Open Lab Sheet
              </a>
            ) : (
              <span className="material-unavailable">Lab Sheet not available</span>
            )}
          </li>

          <li>
            {video.materials?.modelPaper ? (
              <a
                href={video.materials.modelPaper}
                target="_blank"
                rel="noreferrer"
                className="material-link"
              >
                Open Model Paper
              </a>
            ) : (
              <span className="material-unavailable">Model Paper not available</span>
            )}
          </li>
        </ul>
      </div>

      {!authLoading && currentUser?.role === "admin" && (
        <div className="page-actions">
          <Link to={`/edit/${video.id}`} className="edit-link">
            Edit Video
          </Link>

          <button onClick={handleDelete} className="delete-button">
            Delete Video
          </button>
        </div>
      )}
    </div>
  );
}

export default VideoDetails;
