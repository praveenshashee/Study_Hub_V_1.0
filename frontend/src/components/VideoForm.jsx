import { useEffect, useState } from "react";
import {
  createEmptyVideoForm,
  createVideoFormFromVideo,
  toVideoPayload,
  validateVideoForm
} from "../lib/videoForm.js";

export default function VideoForm({
  heading,
  description,
  initialVideo,
  submitLabel,
  successMessage,
  resetOnSuccess = false,
  onSubmit,
  onSuccess
}) {
  const [values, setValues] = useState(() => createVideoFormFromVideo(initialVideo));
  const [message, setMessage] = useState({ tone: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setValues(createVideoFormFromVideo(initialVideo));
  }, [initialVideo]);

  function updateField(event) {
    const { name, value } = event.target;
    setValues((currentValues) => ({
      ...currentValues,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationMessage = validateVideoForm(values);

    if (validationMessage) {
      setMessage({ tone: "error", text: validationMessage });
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage({ tone: "", text: "" });
      const savedVideo = await onSubmit(toVideoPayload(values));
      setMessage({ tone: "success", text: successMessage });

      if (resetOnSuccess) {
        setValues(createEmptyVideoForm());
      }

      if (onSuccess) {
        onSuccess(savedVideo);
      }
    } catch (error) {
      setMessage({
        tone: "error",
        text: error.message || "Failed to save the resource."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="form-shell">
      <div className="section-heading form-heading">
        <div>
          <p className="section-kicker">Resource Editor</p>
          <h1>{heading}</h1>
        </div>
        <p>{description}</p>
      </div>

      <form className="resource-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>Video title</span>
            <input
              type="text"
              name="title"
              value={values.title}
              onChange={updateField}
              placeholder="e.g. Introduction to Data Structures"
            />
          </label>

          <label className="field">
            <span>Subject</span>
            <input
              type="text"
              name="subject"
              value={values.subject}
              onChange={updateField}
              placeholder="e.g. Operating Systems"
            />
          </label>

          <label className="field field-full">
            <span>Description</span>
            <textarea
              rows="5"
              name="description"
              value={values.description}
              onChange={updateField}
              placeholder="Brief description of the video content..."
            />
          </label>

          <label className="field">
            <span>Video URL</span>
            <input
              type="url"
              name="videoUrl"
              value={values.videoUrl}
              onChange={updateField}
              placeholder="https://..."
            />
          </label>

          <label className="field">
            <span>Lecture slides URL</span>
            <input
              type="url"
              name="slidesUrl"
              value={values.slidesUrl}
              onChange={updateField}
              placeholder="https://..."
            />
          </label>

          <label className="field">
            <span>Lab sheet URL</span>
            <input
              type="url"
              name="labSheetUrl"
              value={values.labSheetUrl}
              onChange={updateField}
              placeholder="https://..."
            />
          </label>

          <label className="field">
            <span>Model paper URL</span>
            <input
              type="url"
              name="modelPaperUrl"
              value={values.modelPaperUrl}
              onChange={updateField}
              placeholder="https://..."
            />
          </label>

          <label className="field field-full">
            <span>Uploader name</span>
            <input
              type="text"
              name="uploader"
              value={values.uploader}
              onChange={updateField}
              placeholder="Your name"
            />
          </label>
        </div>

        {message.text ? (
          <div className={`form-message ${message.tone}`}>
            {message.text}
          </div>
        ) : null}

        <div className="submit-row">
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}
