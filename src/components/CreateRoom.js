import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { ArrowLeft, Shield, Gamepad2, Users, Settings, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '@/api/RoomApi';
import { useUser } from '@/context/AuthContext';
import { useGameStore } from '@/store/Store';
const CreateRoom = () => {
    const { userId } = useUser();
    const navigate = useNavigate();
    const setRoom = useGameStore((state) => state.setRoom);
    const [formData, setFormData] = useState({
        name: '',
        maxPlayers: 2
    });
    const [isCreating, setIsCreating] = useState(false);
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    const handleCreateRoom = async () => {
        if (!formData.name.trim()) {
            return;
        }
        setIsCreating(true);
        const room = {
            name: formData.name,
            capacity: formData.maxPlayers,
            player: parseInt(userId || '-1')
        };
        const response = await createRoom(room);
        if (response.room) {
            setRoom(response.room);
            navigate(`/lobby`);
        }
        setIsCreating(false);
    };
    const handleGoBack = () => {
        navigate('/rooms');
    };
    const isFormValid = () => {
        return formData.name.trim() !== '' && formData.maxPlayers > 0;
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white", children: [_jsx("div", { className: "border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700 shadow-2xl", children: _jsxs("div", { className: "container mx-auto px-6 py-8", children: [_jsx("div", { className: "flex items-center gap-4 mb-6", children: _jsxs(Button, { variant: "ghost", size: "sm", onClick: handleGoBack, className: "text-slate-300 hover:text-white hover:bg-slate-700/50 cursor-pointer", children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }), "Back to Rooms"] }) }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Shield, { className: "w-8 h-8 text-green-500" }), _jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent", children: "CREATE NEW ROOM" })] })] }) }), _jsx("div", { className: "container mx-auto px-6 py-8", children: _jsx("div", { className: "flex justify-center", children: _jsxs(Card, { className: "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 w-full max-w-2xl", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-xl text-white", children: [_jsx(Settings, { className: "w-5 h-5 text-green-400" }), "Room Configuration"] }) }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "text-sm font-medium text-slate-300 flex items-center gap-2", children: [_jsx(Gamepad2, { className: "w-4 h-4" }), "Room Name"] }), _jsx(Input, { type: "text", placeholder: "Enter room name...", value: formData.name, onChange: (e) => handleInputChange('name', e.target.value), className: "bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 \r\n                           focus:border-orange-500 focus:ring-orange-500/20", maxLength: 30 }), _jsxs("p", { className: "text-xs text-slate-500", children: [formData.name.length, "/30 characters"] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "text-sm font-medium text-slate-300 flex items-center gap-2", children: [_jsx(Users, { className: "w-4 h-4" }), "Maximum Players"] }), _jsx("div", { className: "flex gap-4 justify-center", children: [2, 4, 6].map((num) => (_jsxs(Button, { variant: formData.maxPlayers === num ? "default" : "outline", size: "lg", onClick: () => handleInputChange('maxPlayers', num), className: `${formData.maxPlayers === num
                                                        ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/30'
                                                        : 'border-slate-600 text-slate-300 hover:border-orange-500/50 hover:bg-slate-700/50'} px-8 py-3 text-lg font-bold transition-all duration-300 cursor-pointer`, children: [num, " Players"] }, num))) })] }), _jsx(Separator, { className: "bg-slate-700" }), _jsx("div", { className: "pt-4", children: _jsx(Button, { size: "lg", onClick: handleCreateRoom, disabled: !isFormValid() || isCreating, className: `w-full ${isFormValid()
                                                ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg hover:shadow-green-500/30'
                                                : 'bg-slate-600 text-slate-400 cursor-not-allowed'} font-bold py-4 px-8 rounded-lg transition-all duration-300 ${isFormValid() ? 'hover:scale-105' : ''} gap-2 h-auto cursor-pointer`, children: isCreating ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" }), "CREATING ROOM..."] })) : (_jsxs(_Fragment, { children: [_jsx(Plus, { className: "w-5 h-5" }), "CREATE ROOM"] })) }) })] })] }) }) })] }));
};
export default CreateRoom;
