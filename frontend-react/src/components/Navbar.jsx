import { NavLink, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

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
                <NavLink to="/" end>
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

                {currentUser ? (
                    <div className="profile-menu" ref={profileMenuRef}>
                        <button
                            type="button"
                            className="profile-icon-btn"
                            onClick={() => setMenuOpen((prev) => !prev)}
                        >
                            <span className="profile-avatar-circle">
                                {currentUser.fullName
                                    ? currentUser.fullName.slice(0, 2).toUpperCase()
                                    : "SH"}
                            </span>
                        </button>

                        {menuOpen && (
                            <div className="profile-dropdown">
                                <div className="profile-dropdown-user">
                                    <strong>{currentUser.fullName}</strong>
                                    <span>{currentUser.role}</span>
                                </div>

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
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="auth-nav-links">
                        <NavLink to="/login">Login</NavLink>
                        <NavLink to="/signup">Sign Up</NavLink>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;