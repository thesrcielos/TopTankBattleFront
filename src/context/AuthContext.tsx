import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";

interface UserContextType {
  userId: string | null;
  setUserId: Dispatch<SetStateAction<string | null>>;
  isAuthenticated: boolean;
  checkAuth: () => boolean;
  login: () => void;
  logout: () => void;
  getToken: () => string | undefined;
  setAuth: () => void;
}

interface JwtPayload {
  id: number;
  exp: number;
}
const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const handleStorageChange = (event: StorageEvent) => {
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
        const decoded = jwtDecode<JwtPayload>(token);
        const currentTime = Date.now() / 1000;
        if (decoded.id && decoded.exp > currentTime) {
          setUserId(String(decoded.id));
          setIsAuthenticated(true);
        }
      } catch (err) {
        setUserId(null);
        setIsAuthenticated(false);
        console.error('Token inválido:', err);
      }
    } else {
      setUserId(null);
      setIsAuthenticated(false);
    }
  }

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

  return (
    <UserContext.Provider
      value={{ userId, setUserId, isAuthenticated, checkAuth, login, logout, getToken, setAuth}}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const setToken = (token: string) => {
    Cookies.set('token', token, {
    path: '/',
    expires: 12/24, 
  });
  window.dispatchEvent(new Event("token-changed"));
};

export const removeToken = () => {
  Cookies.remove('token', { path: '/' });
  window.dispatchEvent(new Event("token-changed"));
};
