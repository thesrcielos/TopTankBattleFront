import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Crown, Play, UserPlus, Swords } from 'lucide-react';
import { useUser } from '@/context/AuthContext';
import { useGameStore } from '@/store/Store';
import { connectToWebSocket, disconnectWS, sendMessage } from '@/services/Websocket';
import { useNavigate } from 'react-router-dom';
import { leaveRoom } from '@/api/RoomApi';
import { toast } from 'sonner';
const RoomLobby = () => {
    const { userId, getToken } = useUser();
    const kicked = useGameStore(state => state.kicked);
    const room = useGameStore(state => state.room);
    const game = useGameStore(state => state.game);
    const setRoom = useGameStore(state => state.setRoom);
    const navigate = useNavigate();
    const isHost = room.host.id === userId;
    const [isStarting, setIsStarting] = useState(false);
    const redTeamPlayers = room.team1;
    const blueTeamPlayers = room.team2;
    const teamsBalanced = Math.abs(redTeamPlayers.length - blueTeamPlayers.length) <= 1;
    const bothTeamsHavePlayers = room.team1.length > 0 && room.team2.length > 0;
    const canStartGame = teamsBalanced && bothTeamsHavePlayers;
    useEffect(() => {
        if (kicked?.id === (userId || "")) {
            toast.info("You were kicked out of the room by the host " + room.host.username);
            setRoom({ id: '',
                name: '',
                capacity: 0,
                team1: [],
                players: 0,
                team2: [],
                host: {
                    id: '',
                    username: '',
                },
                status: "LOBBY", });
            navigate("/rooms");
        }
        else if (kicked !== undefined) {
            toast.info(kicked.username + " was kicked out of the room by the host " + room.host.username);
        }
    }, [kicked]);
    useEffect(() => {
        console.log(room);
        if (room.id !== '') {
            const playerId = userId || '';
            if (playerId !== '') {
                connectToWebSocket(getToken() || "");
            }
            else {
                alert('User id not found');
                navigate('/rooms');
                console.error('User not authenticated');
            }
        }
    }, [room]);
    useEffect(() => {
        if (game !== undefined) {
            setIsStarting(true);
            setIsStarting(false);
            navigate("/game");
        }
    }, [game]);
    const handleLeaveRoom = async () => {
        try {
            await leaveRoom(userId || "");
            disconnectWS();
            setRoom({
                id: '',
                name: '',
                capacity: 0,
                team1: [],
                players: 0,
                team2: [],
                host: {
                    id: '',
                    username: '',
                },
                status: "LOBBY",
            });
            navigate("/rooms");
        }
        catch (error) {
            return;
        }
    };
    const handleStartGame = () => {
        const msg = {
            type: "GAME_START",
            payload: {
                roomId: room.id
            },
        };
        sendMessage(JSON.stringify(msg));
    };
    const handleKickPlayer = (playerId) => {
        if (!isHost)
            return;
        const kickInfo = {
            type: "ROOM_KICK",
            payload: {
                roomId: room.id,
                playerId: playerId
            }
        };
        sendMessage(JSON.stringify(kickInfo));
    };
    const TeamCard = ({ team, players }) => {
        const teamColor = team === 'red' ? 'from-red-500 to-red-600' : 'from-blue-500 to-blue-600';
        const teamBorder = team === 'red' ? 'border-red-500/30' : 'border-blue-500/30';
        const teamBg = team === 'red' ? 'bg-red-500/10' : 'bg-blue-500/10';
        return (_jsxs("div", { className: `bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 ${teamBorder} rounded-lg h-full`, children: [_jsx("div", { className: "p-6 border-b border-slate-700", children: _jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-6 h-6 rounded-full bg-gradient-to-r ${teamColor}` }), _jsxs("span", { className: "capitalize font-bold text-xl", children: [team, " Team"] }), _jsxs("span", { className: `px-3 py-1 rounded-md text-sm border ${teamBorder} ${teamBg} text-${team}-400 font-medium`, children: [players.length, "/", Math.ceil(room.capacity / 2)] })] }) }) }), _jsx("div", { className: "p-6", children: _jsxs("div", { className: "space-y-4", children: [players.map((player) => (_jsx("div", { className: "bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:bg-slate-700/70 transition-colors", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: `w-12 h-12 bg-gradient-to-r ${teamColor} rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg`, children: player.username[0].toUpperCase() }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-semibold text-white text-lg", children: player.username }), player.id === room.host.id && (_jsx(Crown, { className: "w-5 h-5 text-yellow-400" })), player.id === userId && (_jsx("span", { className: 'font-semibold text-white text-xs', children: "(You)" }))] })] }), isHost && !(player.id === room.host.id) && (_jsx("button", { onClick: () => handleKickPlayer(player.id), className: "text-red-400 hover:text-red-300 px-3 py-1 rounded-md hover:bg-red-500/10 transition-colors font-medium", children: "Kick" }))] }) }, player.id))), players.length < Math.ceil(room.capacity / 2) && (_jsx("div", { className: "flex items-center justify-center h-16 text-slate-500 border-2 border-dashed border-slate-600 rounded-lg hover:border-slate-500 transition-colors", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(UserPlus, { className: "w-5 h-5" }), _jsx("span", { className: "text-base font-medium", children: "Waiting for player..." })] }) }))] }) })] }));
    };
    return (_jsxs("div", { className: "h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white flex flex-col", children: [_jsx("div", { className: "border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700 shadow-lg", children: _jsx("div", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: handleLeaveRoom, className: "text-slate-300 hover:text-white hover:bg-slate-700/50 p-1 rounded cursor-pointer", children: _jsx(ArrowLeft, { className: "w-4 h-4" }) }), _jsx("div", { className: "h-4 w-px bg-slate-600" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "w-5 h-5 text-orange-500" }), _jsxs("div", { children: [_jsx("h1", { className: "text-lg font-bold text-white", children: room.name }), _jsxs("p", { className: "text-xs text-slate-400", children: ["Host: ", _jsx("span", { className: "text-orange-400", children: room.host.username })] })] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "px-2 py-1 border border-slate-600 text-slate-300 rounded text-xs", children: ["#", room.id] }), _jsxs("span", { className: "px-2 py-1 border border-red-500/30 bg-red-500/20 text-red-400 rounded text-xs", children: ["Red: ", redTeamPlayers.length] }), _jsxs("span", { className: "px-2 py-1 border border-blue-500/30 bg-blue-500/20 text-blue-400 rounded text-xs", children: ["Blue: ", blueTeamPlayers.length] })] })] }) }) }), _jsx("div", { className: "flex-1 p-6 overflow-y-auto", children: _jsxs("div", { className: "max-w-6xl mx-auto space-y-6", children: [_jsx("div", { className: "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 rounded-lg p-4", children: _jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Swords, { className: "w-5 h-5 text-purple-400" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-white", children: "Team Battle Mode" }), _jsx("p", { className: "text-sm text-slate-400", children: teamsBalanced ? (_jsx("span", { className: "text-green-400", children: "Teams balanced" })) : (_jsx("span", { className: "text-yellow-400", children: "Teams need balancing" })) })] })] }) }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(TeamCard, { team: "red", players: redTeamPlayers }), _jsx(TeamCard, { team: "blue", players: blueTeamPlayers })] }), _jsx("div", { className: "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 rounded-lg p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex items-center gap-4", children: isHost && (_jsx("button", { onClick: handleStartGame, disabled: !canStartGame || isStarting, className: `${canStartGame && !isStarting
                                                ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 shadow-lg hover:shadow-green-500/30 cursor-pointer'
                                                : 'bg-slate-600 text-slate-400 cursor-not-allowed'} text-white font-bold px-8 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 text-lg`, children: isStarting ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" }), "Starting Battle..."] })) : (_jsxs(_Fragment, { children: [_jsx(Play, { className: "w-5 h-5" }), "Start Epic Battle"] })) })) }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-base text-slate-300 font-medium", children: canStartGame ? (_jsx("span", { className: "text-green-400 font-semibold", children: "\uD83C\uDFAE Ready to start!" })) : !teamsBalanced ? (_jsx("span", { className: "text-yellow-400", children: "\u2696\uFE0F Teams need balancing" })) : !bothTeamsHavePlayers ? (_jsx("span", { className: "text-yellow-400", children: "\uD83D\uDC65 Both teams need players" })) : (_jsx("span", { className: "text-green-400", children: "There are enough players" })) }), _jsxs("p", { className: "text-sm text-slate-500 mt-1", children: ["Total Players: ", redTeamPlayers.length + blueTeamPlayers.length, "/", room.capacity] })] })] }) })] }) })] }));
};
export default RoomLobby;
