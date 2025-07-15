import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route } from "react-router-dom";
import TopTankBattleAuth from "@/components/TopTankBattleAuth";
import PrivateRoute from './PrivateRoute';
import GameRooms from "@/components/GameRooms";
import CreateRoom from "@/components/CreateRoom";
import Room from "@/components/RoomLobby";
import Game from "@/Game";
const AppRoutes = () => {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(TopTankBattleAuth, {}) }), _jsxs(Route, { element: _jsx(PrivateRoute, {}), children: [_jsx(Route, { path: "/rooms", element: _jsx(GameRooms, {}) }), _jsx(Route, { path: "/create-room", element: _jsx(CreateRoom, {}) }), _jsx(Route, { path: "/lobby", element: _jsx(Room, {}) }), _jsx(Route, { path: "/game", element: _jsx(Game, {}) })] })] }));
};
export default AppRoutes;
