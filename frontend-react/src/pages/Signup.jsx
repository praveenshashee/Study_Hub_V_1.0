import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import CloudinaryUploadButton from "../components/CloudinaryUploadButton";

function Signup({ refreshCurrentUser }) {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        profileImageUrl: ""
    });

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [imageUploadMessage, setImageUploadMessage] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleProfileImageUploadSuccess = (uploadedImage) => {
        setFormData((prev) => ({
            ...prev,
            profileImageUrl: uploadedImage.secure_url || ""
        }));
        setImageUploadMessage("Profile image uploaded successfully.");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        try {
            const response = await api.post("/api/auth/signup", formData);
            await refreshCurrentUser?.();

            setSuccessMessage(response.data.message || "Signup successful");

            setTimeout(() => {
                navigate("/");
            }, 1000);
        } catch (err) {
            console.error("Signup failed:", err);
            setError(err.response?.data?.message || "Failed to sign up");
        }
    };

    return (
        <div className="auth-page-shell">
            <div className="auth-card">
                <Link to="/" className="back-link auth-back-link">← Back to Home</Link>

                <header className="auth-header">
                    <h1>Create Account</h1>
                    <p>Sign up to access Study Hub as a user.</p>
                </header>

                <form onSubmit={handleSubmit} className="auth-form">
                    <label>Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />

                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <label>Profile Image URL (Optional)</label>
                    <div className="auth-upload-row">
                        <CloudinaryUploadButton
                            onUploadSuccess={handleProfileImageUploadSuccess}
                            buttonLabel="Upload Profile Image"
                            resourceType="image"
                            className="auth-upload-btn"
                        />

                        <input
                            type="url"
                            name="profileImageUrl"
                            placeholder="Or paste an image link manually"
                            value={formData.profileImageUrl}
                            onChange={handleChange}
                        />
                    </div>

                    <p className="auth-field-hint">
                        This is optional. You can upload directly or paste an image link, and it will appear in your profile menu.
                    </p>

                    {imageUploadMessage && (
                        <p className="success-text auth-upload-feedback">{imageUploadMessage}</p>
                    )}

                    {formData.profileImageUrl && (
                        <div className="auth-image-preview-card">
                            <span className="auth-image-preview-label">Profile preview</span>
                            <img
                                src={formData.profileImageUrl}
                                alt="Profile preview"
                                className="auth-image-preview"
                            />
                        </div>
                    )}

                    <button type="submit">Sign Up</button>
                </form>

                {successMessage && <p className="success-text">{successMessage}</p>}
                {error && <p className="error-text">{error}</p>}

                <p className="auth-switch-text">
                    Already have an account?{" "}
                    <Link to="/login" className="auth-inline-link">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;
