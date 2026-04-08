import { Link } from "react-router-dom";

function AccessRequiredModal({ isOpen, onClose, featureName = "this content" }) {
    if (!isOpen) return null;

    return (
        <div className="access-modal-overlay" onClick={onClose}>
            <div
                className="access-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="access-modal-icon">🔒</div>

                <h2>Sign in required</h2>

                <p>
                    Please log in or create an account to access {featureName}.
                </p>

                <div className="access-modal-actions">
                    <Link to="/login" className="access-modal-primary-btn">
                        Login
                    </Link>

                    <Link to="/signup" className="access-modal-secondary-btn">
                        Create Account
                    </Link>
                </div>

                <button
                    type="button"
                    className="access-modal-close"
                    onClick={onClose}
                >
                    Maybe later
                </button>
            </div>
        </div>
    );
}

export default AccessRequiredModal;