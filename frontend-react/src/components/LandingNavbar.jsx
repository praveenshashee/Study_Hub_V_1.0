import { NavLink, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

function LandingNavbar({ theme, toggleTheme, currentUser, onLogout }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target)
            ) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const avatarText = currentUser?.fullName
        ? currentUser.fullName.slice(0, 2).toUpperCase()
        : "GU";

    return (
        <nav className="landing-navbar">
            <Link to="/" className="landing-nav-brand">
                Study Hub
            </Link>

            <div className="landing-nav-right">
                <button
                    type="button"
                    className="theme-toggle-btn"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                >
                    {theme === "light" ? "🌙" : "☀️"}
                </button>

                <div className="profile-menu" ref={profileMenuRef}>
                    <button
                        type="button"
                        className="profile-icon-btn"
                        onClick={() => setMenuOpen((prev) => !prev)}
                    >
                        <span
                            className={`profile-avatar-circle ${currentUser ? "" : "guest-avatar"}`}
                        >
                            {avatarText}
                        </span>
                    </button>

                    {menuOpen && (
                        <div className="profile-dropdown">
                            <div className="profile-dropdown-header">
                                <div
                                    className={`profile-dropdown-avatar ${currentUser ? "" : "guest-avatar"}`}
                                >
                                    {avatarText}
                                </div>

                                <div className="profile-dropdown-user">
                                    <strong>{currentUser ? currentUser.fullName : "Guest User"}</strong>
                                    <span>{currentUser ? currentUser.role : "Not logged in"}</span>
                                </div>
                            </div>

                            {currentUser ? (
                                <>
                                    <NavLink to="/home" onClick={() => setMenuOpen(false)}>
                                        Enter Platform
                                    </NavLink>
                                    <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>
                                        Dashboard
                                    </NavLink>

                                    <button
                                        type="button"
                                        className="logout-btn"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onLogout();
                                        }}
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <NavLink to="/login" onClick={() => setMenuOpen(false)}>
                                        Login
                                    </NavLink>
                                    <NavLink to="/signup" onClick={() => setMenuOpen(false)}>
                                        Sign Up
                                    </NavLink>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default LandingNavbar;