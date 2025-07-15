import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Search, Users, Play, Clock, Shield, Plus, RotateCcw, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { getRooms, joinRoom } from '@/api/RoomApi';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/AuthContext';
import { useGameStore } from '@/store/Store';
// Component
const GameRooms = () => {
    const { userId, logout } = useUser();
    const setRoom = useGameStore(state => state.setRoom);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    // Sample room data
    const [rooms, setRooms] = useState([]);
    const fetchRooms = async () => {
        const data = await getRooms();
        setRooms(data.rooms);
    };
    useEffect(() => {
        fetchRooms();
    }, []);
    const handleRoomsRefresh = () => {
        fetchRooms();
    };
    const getStatusVariant = (status) => {
        return status === 'LOBBY' ? 'default' : 'secondary';
    };
    const getStatusIcon = (status) => {
        return status === 'LOBBY' ? _jsx(Clock, { className: "w-3 h-3" }) : _jsx(Play, { className: "w-3 h-3" });
    };
    const getPlayersTextColor = (current, max) => {
        const percentage = (current / max) * 100;
        if (percentage >= 80)
            return 'text-red-500';
        if (percentage >= 60)
            return 'text-yellow-500';
        return 'text-green-500';
    };
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };
    const handleLogOut = () => {
        logout();
    };
    const handleJoinRoom = async (roomId) => {
        try {
            const room = await joinRoom(userId || "", roomId);
            console.log(room.room);
            setRoom(room.room);
            navigate("/lobby");
        }
        catch (error) {
            alert("Error joining" + error);
        }
    };
    const handleCreateRoom = () => {
        navigate('/create-room');
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white", children: [_jsx("div", { className: "border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700 shadow-2xl", children: _jsxs("div", { className: "container mx-auto px-6 py-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Shield, { className: "w-8 h-8 text-green-500" }), _jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent", children: "TOP TANK BATTLE" })] }), _jsxs("div", { className: 'flex items-center', children: [_jsxs(Badge, { variant: "outline", className: "border-slate-600 text-slate-300", children: ["Available Rooms: ", rooms.length] }), _jsx(Button, { onClick: handleLogOut, className: 'bg-transparent cursor-pointer p-0 ml-4 hover:bg-transparent', children: _jsx(LogOut, { className: 'text-slate-400 h-5 w-5' }) })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "relative flex-1 max-w-2xl min-w-[200px] max-w-[600px]", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" }), _jsx(Input, { type: "text", placeholder: "Search rooms by name, host or map...", value: searchTerm, onChange: handleSearchChange, className: "pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 \r\n                       focus:border-green-500 focus:ring-green-500/20 h-12" })] }), _jsx("div", { className: "flex flex-1 justify-between", children: _jsx(Button, { onClick: handleRoomsRefresh, className: 'hover:bg-transparent ml-2 bg-transparent hover-transparent cursor-pointer p-0', children: _jsx(RotateCcw, { className: 'text-slate-400' }) }) })] })] }) }), _jsxs("div", { className: "container mx-auto px-6 py-8", children: [_jsx("div", { className: "grid gap-6 lg:grid-cols-2 xl:grid-cols-3", children: rooms && rooms.map((room) => (_jsxs(Card, { className: "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 \r\n                       hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl \r\n                       hover:shadow-orange-500/10 hover:scale-105 cursor-pointer group", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx(CardTitle, { className: "text-white text-lg group-hover:text-orange-400 transition-colors duration-300 mb-1", children: room.name }), _jsxs("p", { className: "text-sm text-slate-400", children: ["Host: ", _jsx("span", { className: "text-orange-400 font-medium", children: room.host.username })] })] }), _jsxs(Badge, { variant: getStatusVariant(room.status), className: `flex items-center gap-1 ${room.status === 'LOBBY'
                                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                    : 'bg-orange-500/20 text-orange-400 border-orange-500/30'}`, children: [getStatusIcon(room.status), room.status] })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { className: "w-4 h-4 text-slate-400" }), _jsx("span", { className: "text-sm text-slate-300", children: "Players:" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `text-lg font-bold ${getPlayersTextColor(room.players, room.capacity)}`, children: room.players }), _jsx("span", { className: "text-slate-400", children: "/" }), _jsx("span", { className: "text-slate-300 text-lg font-bold", children: room.capacity })] })] }), _jsx("div", { className: "space-y-1", children: _jsx(Progress, { value: (room.players / room.capacity) * 100, className: "h-2 bg-slate-700" }) })] }), _jsx(Separator, { className: "bg-slate-700" }), _jsx(Button, { className: `w-full ${room.status === 'LOBBY'
                                                ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg hover:shadow-green-500/30 cursor-pointer'
                                                : 'bg-gradient-to-r from-slate-600 to-slate-500 text-slate-300 cursor-not-allowed'}`, disabled: room.status === 'PLAYING', size: "lg", onClick: () => handleJoinRoom(room.id), children: room.status === 'LOBBY' ? 'JOIN ROOM' : 'GAME IN PROGRESS' })] })] }, room.id))) }), !rooms || rooms.length === 0 && (_jsx("div", { className: "text-center py-16", children: _jsx(Card, { className: "bg-slate-800/50 border-slate-700 max-w-md mx-auto", children: _jsxs(CardContent, { className: "pt-8 pb-8", children: [_jsx(Search, { className: "w-16 h-16 text-slate-600 mx-auto mb-4" }), _jsx(CardTitle, { className: "text-xl text-slate-300 mb-2", children: "No rooms found" }), _jsx("p", { className: "text-slate-500", children: "Try different search terms or create a new room" })] }) }) }))] }), _jsx("div", { className: "fixed bottom-8 right-8", children: _jsxs(Button, { size: "lg", className: "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 \r\n                   text-white font-bold py-4 px-6 rounded-full shadow-2xl hover:shadow-orange-500/30 \r\n                   transition-all duration-300 hover:scale-110 gap-2 h-auto cursor-pointer", onClick: handleCreateRoom, children: [_jsx(Plus, { className: "w-5 h-5" }), "CREATE ROOM"] }) })] }));
};
export default GameRooms;
