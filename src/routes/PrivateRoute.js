import { jsx as _jsx } from "react/jsx-runtime";
import { useUser } from "@/context/AuthContext";
import { Navigate, Outlet } from 'react-router-dom';
export const PrivateRoute = () => {
    const { isAuthenticated } = useUser();
    console.log("isAuthenticated", isAuthenticated);
    return isAuthenticated ? _jsx(Outlet, {}) : _jsx(Navigate, { to: "/" });
};
export default PrivateRoute;
