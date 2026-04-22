import { Navigate } from "react-router-dom";

function ProtectedRoute({
  currentUser,
  authLoading,
  children,
  requiredRole,
  redirectTo = "/login"
}) {
  if (authLoading) {
    return <p className="page-message">Checking access...</p>;
  }

  if (!currentUser) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
