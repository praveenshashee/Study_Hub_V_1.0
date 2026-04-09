import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";

function Login({ refreshCurrentUser }) {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
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
            const response = await api.post("/api/auth/login", formData);
            await refreshCurrentUser?.();

            setSuccessMessage(response.data.message || "Login successful");

            setTimeout(() => {
                navigate("/");
            }, 1000);
        } catch (err) {
            console.error("Login failed:", err);
            setError(err.response?.data?.message || "Failed to log in");
        }
    };

    return (
        <div className="auth-page-shell">
            <div className="auth-card">
                <Link to="/" className="back-link auth-back-link">← Back to Home</Link>

                <header className="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Log in to continue using Study Hub.</p>
                </header>

                <form onSubmit={handleSubmit} className="auth-form">
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

                    <button type="submit">Login</button>
                </form>

                {successMessage && <p className="success-text">{successMessage}</p>}
                {error && <p className="error-text">{error}</p>}

                <p className="auth-switch-text">
                    Don’t have an account?{" "}
                    <Link to="/signup" className="auth-inline-link">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
