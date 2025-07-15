import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, } from "react";
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";
const UserContext = createContext(undefined);
export const UserProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const handleStorageChange = (event) => {
        if (event.key === "token") {
            setAuth();
        }
    };
    const handleTokenChanged = () => {
        setAuth();
    };
    const setAuth = () => {
        const token = Cookies.get('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                if (decoded.id && decoded.exp > currentTime) {
                    setUserId(String(decoded.id));
                    setIsAuthenticated(true);
                }
            }
            catch (err) {
                setUserId(null);
                setIsAuthenticated(false);
                console.error('Token inválido:', err);
            }
        }
        else {
            setUserId(null);
            setIsAuthenticated(false);
        }
    };
    useEffect(() => {
        setAuth();
        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("token-changed", handleTokenChanged);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("token-changed", handleTokenChanged);
        };
    }, []);
    const checkAuth = () => {
        const token = Cookies.get('token');
        return !!token;
    };
    const getToken = () => {
        return Cookies.get('token');
    };
    const login = () => setIsAuthenticated(true);
    const logout = () => {
        removeToken();
        setIsAuthenticated(false);
    };
    return (_jsx(UserContext.Provider, { value: { userId, setUserId, isAuthenticated, checkAuth, login, logout, getToken, setAuth }, children: children }));
};
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
export const setToken = (token) => {
    Cookies.set('token', token, {
        path: '/',
        expires: 12 / 24,
    });
    window.dispatchEvent(new Event("token-changed"));
};
export const removeToken = () => {
    Cookies.remove('token', { path: '/' });
    window.dispatchEvent(new Event("token-changed"));
};
