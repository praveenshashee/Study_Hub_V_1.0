import { NavLink, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

function Navbar({ theme, toggleTheme }) {
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
                <NavLink to="/dashboard">
                    Dashboard
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
                    >
                        <span className="profile-avatar-circle">SH</span>
                    </button>

                    {menuOpen && (
                        <div className="profile-dropdown">
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
                                    alert("Logout action can be connected later.");
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
