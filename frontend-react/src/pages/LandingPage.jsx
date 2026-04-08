import { Link } from "react-router-dom";

function LandingPage({ currentUser }) {
    return (
        <main className="landing-page">
            <section className="landing-hero">
                <div className="landing-hero-content">
                    <span className="landing-badge">Smart Student Learning Platform</span>

                    <h1>
                        One vibrant place for
                        <span className="landing-highlight">
                            {" "}learning, opportunities, and student growth.
                        </span>
                    </h1>

                    <p className="landing-subtitle">
                        Study Hub helps university students access academic videos, lab sheets,
                        model papers, internship opportunities, and future student-focused tools
                        through one modern and organized platform.
                    </p>

                    <div className="landing-cta-row">
                        <Link to="/home" className="landing-primary-btn">
                            Explore Platform
                        </Link>

                        {currentUser ? (
                            <Link to="/dashboard" className="landing-secondary-btn">
                                Go to Dashboard
                            </Link>
                        ) : (
                            <Link to="/signup" className="landing-secondary-btn">
                                Create Account
                            </Link>
                        )}
                    </div>

                    <div className="landing-stats">
                        <div className="landing-stat-card">
                            <strong>Video Learning</strong>
                            <span>Academic resources in one place</span>
                        </div>

                        <div className="landing-stat-card">
                            <strong>Career Growth</strong>
                            <span>Internships and opportunities</span>
                        </div>

                        <div className="landing-stat-card">
                            <strong>Student Focused</strong>
                            <span>Built for modern university life</span>
                        </div>
                    </div>
                </div>

                <div className="landing-visual-area">
                    <div className="landing-glow landing-glow-one"></div>
                    <div className="landing-glow landing-glow-two"></div>

                    <div className="landing-panel main-panel">
                        <div className="landing-panel-chip">Study Hub Experience</div>
                        <h3>Modern academic support for students</h3>
                        <p>
                            Discover learning videos, access materials, rate useful content,
                            and explore internship opportunities through one connected platform.
                        </p>
                    </div>

                    <div className="landing-floating-card floating-card-one">
                        <span>📘 Lab Sheets</span>
                    </div>

                    <div className="landing-floating-card floating-card-two">
                        <span>🎓 Model Papers</span>
                    </div>

                    <div className="landing-floating-card floating-card-three">
                        <span>💼 Internships</span>
                    </div>
                </div>
            </section>

            <section className="landing-feature-strip">
                <div className="landing-feature-card">
                    <h3>Structured Learning</h3>
                    <p>
                        Watch video lessons and explore supporting materials in a cleaner,
                        more organized way.
                    </p>
                </div>

                <div className="landing-feature-card">
                    <h3>Real Student Value</h3>
                    <p>
                        Built to help students study smarter, save time, and access helpful
                        academic content faster.
                    </p>
                </div>

                <div className="landing-feature-card">
                    <h3>Growth Beyond Study</h3>
                    <p>
                        Connect learning with internships, future events, and a stronger
                        university journey.
                    </p>
                </div>
            </section>
        </main>
    );
}

export default LandingPage;