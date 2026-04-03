import { NavLink, Outlet } from "react-router-dom";

function navigationClassName({ isActive }) {
  return isActive ? "nav-link active" : "nav-link";
}

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark">SH</span>
          <div>
            <p className="brand-kicker">React + Node</p>
            <NavLink to="/" className="brand-name">
              Study Hub
            </NavLink>
          </div>
        </div>

        <nav className="topbar-nav">
          <NavLink to="/" end className={navigationClassName}>
            Home
          </NavLink>
          <NavLink to="/dashboard" className={navigationClassName}>
            Dashboard
          </NavLink>
          <NavLink to="/upload" className={navigationClassName}>
            Upload
          </NavLink>
        </nav>
      </header>

      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  );
}
