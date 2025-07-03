import { Routes, Route } from "react-router-dom";
import TopTankBattleAuth from "@/components/TopTankBattleAuth";
import PrivateRoute from './PrivateRoute';
import GameRooms from "@/components/GameRooms";
import CreateRoom from "@/components/CreateRoom";
import Room from "@/components/RoomLobby";

const AppRoutes = () =>{
    return (
        <Routes>
            <Route path="/" element={<TopTankBattleAuth/>}/>
            <Route element={<PrivateRoute/>}>
                <Route path="/rooms" element={<GameRooms/>}/>
                <Route path="/create-room" element={<CreateRoom/>}/>
                <Route path="/lobby" element={<Room/>}/>
            </Route>
        </Routes>
    );
}

export default AppRoutes;