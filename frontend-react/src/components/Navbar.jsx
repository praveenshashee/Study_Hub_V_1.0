import { NavLink } from "react-router-dom";

function Navbar() {
    return (
        <nav className="navbar">
            <NavLink to="/" className="nav-brand">
                Study Hub
            </NavLink>

            <div className="nav-links">
                <NavLink to="/" end>
                    Home
                </NavLink>
            </div>
        </nav>
    );
}

export default Navbar;