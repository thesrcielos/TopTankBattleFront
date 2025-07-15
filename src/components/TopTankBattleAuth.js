import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Shield, Target, Users, LogIn, CircleX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loginUser, signup } from '@/api/UserApi';
import { useUser } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { setToken } from '@/context/AuthContext';
const TopTankBattleAuth = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [registerData, setRegisterData] = useState({ username: '', password: '' });
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { checkAuth, setAuth } = useUser();
    const handleAuthentication = () => {
        navigate("/rooms");
    };
    useEffect(() => {
        if (checkAuth()) {
            handleAuthentication();
        }
    }, [checkAuth]);
    const handleSubmit = async (isLogin) => {
        const data = isLogin ? loginData : registerData;
        if (!data.username.trim() || !data.password.trim()) {
            setError("Please fill all the fields");
            return;
        }
        setLoading(true);
        setError(null);
        let response;
        if (isLogin) {
            try {
                response = await loginUser(data);
            }
            catch (e) {
                setLoading(false);
                if (e.response.status >= 500) {
                    setError("Error, please try again later.");
                }
                else {
                    setError(e.response.data.error);
                }
                return;
            }
        }
        else {
            try {
                response = await signup(data);
            }
            catch (e) {
                setLoading(false);
                if (e.response.status >= 500) {
                    setError("Error, please try again later.");
                }
                else {
                    setError(e.response.data.error);
                }
                return;
            }
        }
        const token = response.token;
        setToken(token);
        setAuth();
        if (checkAuth()) {
            handleAuthentication();
        }
    };
    const updateLoginData = (field, value) => {
        setLoginData(prev => ({ ...prev, [field]: value }));
    };
    const updateRegisterData = (field, value) => {
        setRegisterData(prev => ({ ...prev, [field]: value }));
    };
    return (_jsx("div", { className: "min-h-screen w-full bg-gradient-to-br from-slate-900 via-green-900 to-slate-800 flex items-center justify-center p-4", children: _jsxs("div", { className: "relative w-full max-w-6xl z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center", children: [_jsxs("div", { className: "text-center lg:text-left space-y-6", children: [_jsx("div", { className: "flex justify-center lg:justify-start", children: _jsx("div", { className: "inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-600 to-green-800 rounded-full shadow-2xl", children: _jsx(Target, { className: "w-12 h-12 text-white" }) }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("h1", { className: "text-6xl lg:text-7xl font-bold text-white tracking-wide leading-tight", children: ["TOP TANK", _jsx("br", {}), _jsx("span", { className: "text-green-400", children: "BATTLE" })] }), _jsx("p", { className: "text-green-400 text-lg font-medium tracking-widest", children: "FORTRESS DESTROYER" }), _jsxs("div", { className: "space-y-3 text-gray-300 text-lg max-w-lg", children: [_jsx("p", { children: "\u26A1 Command your tank battalion" }), _jsx("p", { children: "\uD83C\uDFAF Destroy enemy fortresses" }), _jsx("p", { children: "\uD83C\uDFC6 Dominate the battlefield" }), _jsx("p", { children: "\uD83D\uDD25 Epic multiplayer combat" })] }), _jsx("div", { className: "pt-4 hidden lg:block", children: _jsxs("p", { className: "text-gray-400 text-sm", children: ["Join thousands of commanders in the ultimate tank warfare experience.", _jsx("br", {}), "Prepare for the most epic battle of your gaming career!"] }) })] })] }), _jsx("div", { className: "w-full max-w-md mx-auto", children: _jsxs(Card, { className: "bg-black/40 backdrop-blur-lg border-green-500/20 shadow-2xl", children: [_jsxs(CardHeader, { className: "space-y-1", children: [_jsx(CardTitle, { className: "text-2xl text-center text-white font-bold tracking-wide", children: "COMBAT ACCESS" }), _jsx(CardDescription, { className: "text-center text-green-400", children: "Enter your credentials to join the battle" })] }), _jsxs(CardContent, { children: [_jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2 bg-gray-700/50 mb-6 h-12", children: [_jsxs(TabsTrigger, { value: "login", className: "data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-300 hover:bg-gray-600/50 font-semibold transition-all duration-300", children: [_jsx(LogIn, { className: "w-4 h-4 mr-2" }), "LOGIN"] }), _jsxs(TabsTrigger, { value: "register", className: "data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-300 hover:bg-gray-600/50 font-semibold transition-all duration-300", children: [_jsx(Users, { className: "w-4 h-4 mr-2" }), "REGISTER"] })] }), _jsxs(TabsContent, { value: "login", className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "login-username", className: "text-green-400 font-semibold tracking-wide", children: "USERNAME" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "login-username", type: "text", value: loginData.username, onChange: (e) => updateLoginData('username', e.target.value), placeholder: "Enter your username", className: "bg-gray-900/50 border-green-500/30 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10 transition-all duration-300" }), _jsx(Shield, { className: "absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "login-password", className: "text-green-400 font-semibold tracking-wide", children: "PASSWORD" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "login-password", type: showLoginPassword ? 'text' : 'password', value: loginData.password, onChange: (e) => updateLoginData('password', e.target.value), placeholder: "Enter your password", className: "bg-gray-900/50 border-green-500/30 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10 transition-all duration-300" }), _jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => setShowLoginPassword(!showLoginPassword), className: "absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-green-500 hover:text-green-400 cursor-pointer", children: showLoginPassword ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }) })] })] }), _jsx(Button, { onClick: () => handleSubmit(true), disabled: loading, className: "w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-6 text-lg tracking-wide transition-all \r\n                    duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer", children: loading ? (_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" }), "PROCESSING..."] })) : ('ENTER COMBAT') })] }), _jsxs(TabsContent, { value: "register", className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "register-username", className: "text-green-400 font-semibold tracking-wide", children: "USERNAME" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "register-username", type: "text", value: registerData.username, onChange: (e) => updateRegisterData('username', e.target.value), placeholder: "Choose your username", className: "bg-gray-900/50 border-green-500/30 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10 transition-all duration-300" }), _jsx(Shield, { className: "absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "register-password", className: "text-green-400 font-semibold tracking-wide", children: "PASSWORD" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "register-password", type: showRegisterPassword ? 'text' : 'password', value: registerData.password, onChange: (e) => updateRegisterData('password', e.target.value), placeholder: "Create your password", className: "bg-gray-900/50 border-green-500/30 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10 transition-all duration-300" }), _jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => setShowRegisterPassword(!showRegisterPassword), className: "cursor-pointer absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-green-500 hover:text-green-400", children: showRegisterPassword ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }) })] })] }), _jsx(Button, { onClick: () => handleSubmit(false), disabled: loading, className: "w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 cursor-pointer\r\n                    disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-6 text-lg tracking-wide transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl", children: loading ? (_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" }), "PROCESSING..."] })) : ('JOIN BATTLE') })] })] }), error && (_jsx(Alert, { className: 'mt-2 border-red-400 bg-gray-900/50 p-2', children: _jsxs(AlertDescription, { className: 'text-red-400 flex items-center', children: [_jsx(CircleX, { className: 'text-red-400 stroke-[1px] mr-1' }), error] }) }))] })] }) })] }) }));
};
export default TopTankBattleAuth;
