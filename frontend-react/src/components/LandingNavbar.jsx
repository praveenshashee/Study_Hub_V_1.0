import { NavLink, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import UserAvatar from "./UserAvatar";

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
                        aria-expanded={menuOpen}
                        aria-label="Open profile menu"
                    >
                        <UserAvatar
                            currentUser={currentUser}
                            className="profile-avatar-circle"
                        />
                    </button>

                    <div
                        className={`profile-dropdown ${menuOpen ? "open" : ""}`}
                        aria-hidden={!menuOpen}
                    >
                            <div className="profile-dropdown-header">
                                <UserAvatar
                                    currentUser={currentUser}
                                    className="profile-dropdown-avatar"
                                />

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
                                        onClick={async () => {
                                            const didLogout = await onLogout();

                                            if (!didLogout) {
                                                return;
                                            }

                                            setMenuOpen(false);
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
                </div>
            </div>
        </nav>
    );
}

export default LandingNavbar;
