import { Outlet } from "react-router-dom";
import { AuthProvider } from "../AuthContext";

export default function AuthLayout() {
    return (
        <AuthProvider>
            <Outlet />
        </AuthProvider>
    );
}
