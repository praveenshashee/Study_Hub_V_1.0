import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";

function Signup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        try {
            const response = await api.post("/api/auth/signup", formData);

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