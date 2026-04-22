import { NavLink, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import UserAvatar from "./UserAvatar";

function Navbar({ theme, toggleTheme, currentUser, onLogout }) {
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
        <nav className="navbar">
            <Link to="/" className="nav-brand">
                Study Hub
            </Link>

            <div className="nav-center-links">
                <NavLink to="/home" end>
                    Home
                </NavLink>
                <NavLink to="/internships">
                    Internships
                </NavLink>
                <NavLink to="/events">
                    Events
                </NavLink>
            </div>

            <div className="nav-right">
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
                                    <span>
                                        {currentUser ? currentUser.role : "Not logged in"}
                                    </span>
                                </div>
                            </div>

                            {currentUser ? (
                                <>
                                    <NavLink to="/profile" onClick={() => setMenuOpen(false)}>
                                        My Profile
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
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
