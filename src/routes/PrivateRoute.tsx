import { useUser } from "@/context/AuthContext";
import { Navigate, Outlet } from 'react-router-dom';

export const PrivateRoute = () => {
    const {isAuthenticated} = useUser();
    console.log("isAuthenticated", isAuthenticated);
    return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
  };
  

export default PrivateRoute;