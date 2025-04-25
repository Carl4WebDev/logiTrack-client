import { useAuth } from "../../contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, redirectPath = "/auth" }) => {
  const { user } = useAuth();

  // If no specific roles required, just check authentication
  if (!allowedRoles) {
    return user ? <Outlet /> : <Navigate to={redirectPath} replace />;
  }

  // If user doesn't exist
  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }

  // If user exists but doesn't have required role
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // If all checks pass
  return <Outlet />;
};

export default ProtectedRoute;
