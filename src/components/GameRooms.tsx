import React, { useState, useEffect } from 'react';
import { Search, Users, Play, Clock, Shield, Plus, RotateCcw, LogOut, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Room } from '@/types/types';
import { getRooms, joinRoom } from '@/api/RoomApi';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/AuthContext';
import { useGameStore } from '@/store/Store';

type RoomStatus = 'LOBBY' | 'PLAYING';

// Component
const GameRooms: React.FC = () => {
  const {userId, logout} = useUser();
  const setRoom = useGameStore(state => state.setRoom)
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Sample room data
  const [rooms, setRooms] = useState<Room[]>([]);

  const fetchRooms = async () => {
    const data = await getRooms();
    setRooms(data.rooms);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleRoomsRefresh = () => {
    fetchRooms();
  }
  const getStatusVariant = (status: RoomStatus): "default" | "secondary" => {
    return status === 'LOBBY' ? 'default' : 'secondary';
  };

  const getStatusIcon = (status: RoomStatus): React.ReactNode => {
    return status === 'LOBBY' ? <Clock className="w-3 h-3" /> : <Play className="w-3 h-3" />;
  };

  const getPlayersTextColor = (current: number, max: number): string => {
    const percentage: number = (current / max) * 100;
    if (percentage >= 80) return 'text-red-500';
    if (percentage >= 60) return 'text-yellow-500';
    return 'text-green-500';
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleLogOut = () => {
    logout();
  }

  const handleJoinRoom = async (roomId: string) => {
    try{
    const room = await joinRoom(userId || "", roomId);
    console.log(room.room)
    setRoom(room.room);
    navigate("/lobby")

    }catch(error){
      alert("Error joining" + error);
    }
  };

  const handleCreateRoom = (): void => {
    navigate('/create-room');
  };

  const handleViewStats = () => {
    navigate("/stats");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700 shadow-2xl">
        <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-500" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
              TOP TANK BATTLE
            </h1>
          </div>
          <div className='flex items-center gap-3'>
            <Badge variant="outline" className="border-slate-600 text-slate-300">
              Available Rooms: {rooms.length}
            </Badge>
            <Button onClick={handleLogOut} className='bg-transparent cursor-pointer p-2 hover:bg-slate-700/50 
                                                  hover:border-slate-500 transition-all duration-200'>
              <LogOut className='text-slate-300 hover:text-slate-400 h-5 w-5' />
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-2xl min-w-[200px] max-w-[600px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-300 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search rooms by name, host or map..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-300
                        focus:border-green-500 focus:ring-green-500/20 h-12"
            />
          </div>
          <div className="flex flex-1 justify-between">
            <Button onClick={handleRoomsRefresh} className='hover:bg-slate-700/50 ml-2 bg-transparent 
                                                            cursor-pointer p-2  
                                                            hover:border-slate-500 transition-all duration-200'>
              <RotateCcw className='text-slate-300 hover:text-slate-300' />
            </Button>
            <Button 
              onClick={handleViewStats} 
              className='bg-transparent hover:from-slate-500 hover:to-slate-400
                        text-slate-300 border-0 px-4 py-2 h-10 flex items-center gap-2
                        transition-all duration-300 cursor-pointer'
            >
              <TrendingUp className='h-4 w-4' />
              <span className="font-medium">My Stats</span>
            </Button>
          </div>
        </div>
        </div>
      </div>

      {/* Room List */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {rooms && rooms.map((room: Room) => (
            <Card 
              key={room.id}
              className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 
                       hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl 
                       hover:shadow-orange-500/10 hover:scale-105 cursor-pointer group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg group-hover:text-orange-400 transition-colors duration-300 mb-1">
                      {room.name}
                    </CardTitle>
                    <p className="text-sm text-slate-400">
                      Host: <span className="text-orange-400 font-medium">{room.host.username}</span>
                    </p>
                  </div>
                  <Badge 
                    variant={getStatusVariant(room.status)}
                    className={`flex items-center gap-1 ${
                      room.status === 'LOBBY' 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                    }`}
                  >
                    {getStatusIcon(room.status)}
                    {room.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Players Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-300">Players:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${getPlayersTextColor(room.players, room.capacity)}`}>
                        {room.players}
                      </span>
                      <span className="text-slate-400">/</span>
                      <span className="text-slate-300 text-lg font-bold">
                        {room.capacity}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <Progress 
                      value={(room.players / room.capacity) * 100}
                      className="h-2 bg-slate-700"
                    />
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                {/* Action Button */}
                <Button 
                  className={`w-full ${
                    room.status === 'LOBBY'
                      ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg hover:shadow-green-500/30 cursor-pointer'
                      : 'bg-gradient-to-r from-slate-600 to-slate-500 text-slate-300 cursor-not-allowed'
                  }`}
                  disabled={room.status === 'PLAYING'}
                  size="lg"
                  onClick={() => handleJoinRoom(room.id)}
                >
                  {room.status === 'LOBBY' ? 'JOIN ROOM' : 'GAME IN PROGRESS'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No rooms message */}
        {!rooms || rooms.length === 0 && (
          <div className="text-center py-16">
            <Card className="bg-slate-800/50 border-slate-700 max-w-md mx-auto">
              <CardContent className="pt-8 pb-8">
                <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <CardTitle className="text-xl text-slate-300 mb-2">
                  No rooms found
                </CardTitle>
                <p className="text-slate-500">
                  Try different search terms or create a new room
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Floating Create Room Button */}
      <div className="fixed bottom-8 right-8">
        <Button 
          size="lg"
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 
                   text-white font-bold py-4 px-6 rounded-full shadow-2xl hover:shadow-orange-500/30 
                   transition-all duration-300 hover:scale-110 gap-2 h-auto cursor-pointer"
          onClick={handleCreateRoom}
        >
          <Plus className="w-5 h-5" />
          CREATE ROOM
        </Button>
      </div>
    </div>
  );
};

export default GameRooms;