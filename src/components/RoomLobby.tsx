import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Crown, Play, UserPlus,  Swords, RotateCcw } from 'lucide-react';
import { useUser } from '@/context/AuthContext';
import { useGameStore } from '@/store/Store';
import { connectToWebSocket, disconnectWS, sendMessage } from '@/services/Websocket';
import { useNavigate } from 'react-router-dom';
import { leaveRoom } from '@/api/RoomApi';
import { toast } from 'sonner';

const RoomLobby: React.FC = () => {
  const {userId, getToken} = useUser();
  const kicked = useGameStore(state => state.kicked);
  const room = useGameStore(state => state.room);
  const game = useGameStore(state => state.game);
  const setRoom = useGameStore(state => state.setRoom);
  const navigate = useNavigate();
  const isHost = room.host.id === userId;
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const redTeamPlayers = room.team1;
  const blueTeamPlayers = room.team2;

  const teamsBalanced = Math.abs(redTeamPlayers.length - blueTeamPlayers.length) <= 1;
  const bothTeamsHavePlayers = room.team1.length > 0 && room.team2.length > 0;
  const canStartGame = teamsBalanced && bothTeamsHavePlayers;
  
  useEffect(() => {
    if(kicked?.id === (userId || "")) {
      toast.info("You were kicked out of the room by the host " + room.host.username);
      setRoom( {id: '',
        name: '',
        capacity: 0,
        team1: [],
        players: 0,
        team2: [],
        host: {
            id: '',
            username: '',
        },
        status: "LOBBY",});
      navigate("/rooms");
    }else if(kicked !== undefined){
      toast.info(kicked.username + " was kicked out of the room by the host " + room.host.username);
    }
  },[kicked]);
  
  useEffect(() => {
    console.log(room);
    if (room.id !== '') {
      const playerId = userId || '';
      if (playerId !== '') {
        connectToWebSocket(getToken() || "");
      } else {
        alert('User id not found');
        navigate('/rooms');
        console.error('User not authenticated');
      }
    }
  }, [room]);

  useEffect(() => {
    if(game !== undefined){
      setIsStarting(true);
      
      setIsStarting(false);
      navigate("/game");
    }
  }, [game])

  const handleLeaveRoom = async () => {
    try{
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
    })
      navigate("/rooms");
    }catch(error){
      return;
    }
  };

  const handleStartGame = () => {
    const msg = {
      type: "GAME_START",
      payload: {
        roomId: room.id
      },
    }

    sendMessage(JSON.stringify(msg));
  }

  const handleKickPlayer = (playerId: string): void => {
    if (!isHost) return;
    const kickInfo = {
      type: "ROOM_KICK",
      payload: {
        roomId: room.id,
        playerId: playerId
      }
    }
    sendMessage(JSON.stringify(kickInfo));
  }

  const TeamCard: React.FC<{ team: 'red' | 'blue', players: any[] }> = ({ team, players }) => {
    const teamColor = team === 'red' ? 'from-red-500 to-red-600' : 'from-blue-500 to-blue-600';
    const teamBorder = team === 'red' ? 'border-red-500/30' : 'border-blue-500/30';
    const teamBg = team === 'red' ? 'bg-red-500/10' : 'bg-blue-500/10';

    return (
      <div className={`bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 ${teamBorder} rounded-lg h-full`}>
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${teamColor}`} />
              <span className="capitalize font-bold text-xl">{team} Team</span>
              <span className={`px-3 py-1 rounded-md text-sm border ${teamBorder} ${teamBg} text-${team}-400 font-medium`}>
                {players.length}/{Math.ceil(room.capacity / 2)}
              </span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {players.map((player) => (
              <div key={player.id} className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:bg-slate-700/70 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${teamColor} rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg`}>
                      {player.username[0].toUpperCase()}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-lg">{player.username}</span>
                      {player.id === room.host.id && (
                        <Crown className="w-5 h-5 text-yellow-400" />
                      )}
                      {player.id === userId && (
                        <span className='font-semibold text-white text-xs'>(You)</span>
                      )}
                    </div>
                  </div>
                  
                  {isHost && !(player.id === room.host.id) && (
                    <button
                      onClick={() => handleKickPlayer(player.id)}
                      className="text-red-400 hover:text-red-300 px-3 py-1 rounded-md hover:bg-red-500/10 transition-colors font-medium"
                    >
                      Kick
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {players.length < Math.ceil(room.capacity / 2) && (
              <div className="flex items-center justify-center h-16 text-slate-500 border-2 border-dashed border-slate-600 rounded-lg hover:border-slate-500 transition-colors">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-5 h-5" />
                  <span className="text-base font-medium">Waiting for player...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white flex flex-col">
      {/* Compact Header */}
      <div className="border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700 shadow-lg">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleLeaveRoom}
                className="text-slate-300 hover:text-white hover:bg-slate-700/50 p-1 rounded cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="h-4 w-px bg-slate-600" />
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-500" />
                <div>
                  <h1 className="text-lg font-bold text-white">{room.name}</h1>
                  <p className="text-xs text-slate-400">
                    Host: <span className="text-orange-400">{room.host.username}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 border border-slate-600 text-slate-300 rounded text-xs">
                #{room.id}
              </span>
              <span className="px-2 py-1 border border-red-500/30 bg-red-500/20 text-red-400 rounded text-xs">
                Red: {redTeamPlayers.length}
              </span>
              <span className="px-2 py-1 border border-blue-500/30 bg-blue-500/20 text-blue-400 rounded text-xs">
                Blue: {blueTeamPlayers.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Teams Only */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Quick Status Bar */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Swords className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="font-medium text-white">Team Battle Mode</p>
                  <p className="text-sm text-slate-400">
                    {teamsBalanced ? (
                      <span className="text-green-400">Teams balanced</span>
                    ) : (
                      <span className="text-yellow-400">Teams need balancing</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Teams Grid - Now using full width */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TeamCard team="red" players={redTeamPlayers} />
            <TeamCard team="blue" players={blueTeamPlayers} />
          </div>

          {/* Game Controls */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {isHost && (
                  <button
                    onClick={handleStartGame}
                    disabled={!canStartGame || isStarting}
                    className={`${
                      canStartGame && !isStarting
                        ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 shadow-lg hover:shadow-green-500/30 cursor-pointer'
                        : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    } text-white font-bold px-8 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 text-lg`}
                  >
                    {isStarting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Starting Battle...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Start Epic Battle
                      </>
                    )}
                  </button>
                )}
              </div>
              
              <div className="text-right">
                <p className="text-base text-slate-300 font-medium">
                  {canStartGame ? (
                    <span className="text-green-400 font-semibold">🎮 Ready to start!</span>
                  ) : !teamsBalanced ? (
                    <span className="text-yellow-400">⚖️ Teams need balancing</span>
                  ) : !bothTeamsHavePlayers ? (
                    <span className="text-yellow-400">👥 Both teams need players</span>
                  ) : (
                    <span className="text-green-400">There are enough players</span>
                  )}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Total Players: {redTeamPlayers.length + blueTeamPlayers.length}/{room.capacity}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomLobby;
