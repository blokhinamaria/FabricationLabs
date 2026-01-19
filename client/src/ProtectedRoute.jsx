import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function ProtectedRoute ({ children, allowedRoles }) {
    const { user, redirect, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>
    }

    if (!user) {
        return <Navigate to='/' replace />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'admin' || user.role === 'demo-admin') {
            return <Navigate to={redirect} replace />
        }
        return <Navigate to={redirect} replace />
    }
    return children;
}