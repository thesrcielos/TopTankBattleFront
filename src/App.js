import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './App.css';
import AppRoutes from './routes/AppRoutes';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from './context/AuthContext';
import { Toaster } from "@/components/ui/sonner";
function App() {
    return (_jsxs(UserProvider, { children: [_jsx(Router, { children: _jsx(Routes, { children: _jsx(Route, { path: '/*', element: _jsx(AppRoutes, {}) }) }) }), _jsx(Toaster, { position: 'top-right' })] }));
}
export default App;
