import React, { useState } from 'react';
import { ArrowLeft, Shield, Gamepad2, Users, Settings, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '@/api/RoomApi';
import { useUser } from '@/context/AuthContext';
import { RoomCreate } from '@/types/types';
import { useGameStore } from '@/store/Store';

// Types
interface CreateRoomForm {
  name: string;
  maxPlayers: number;
}

const CreateRoom: React.FC = () => {
  const {userId} = useUser();
  const navigate = useNavigate();
  const setRoom = useGameStore((state) => state.setRoom);
  const [formData, setFormData] = useState<CreateRoomForm>({
    name: '',
    maxPlayers: 2
  });

  const [isCreating, setIsCreating] = useState<boolean>(false);

  const handleInputChange = (field: keyof CreateRoomForm, value: string | number | boolean): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateRoom = async (): Promise<void> => {
    if (!formData.name.trim()) {
      return;
    }

    setIsCreating(true);
    const room: RoomCreate = {
      name: formData.name,
      capacity: formData.maxPlayers,
      player: parseInt(userId || '-1')
    }
    try{
      const response = await createRoom(room);
      if (response.room) {
        setRoom(response.room);
        navigate(`/lobby`);
      }
    }catch(err){
      console.log(err)
      setIsCreating(false);
    }
    setIsCreating(false);
  };

  const handleGoBack = (): void => {
    navigate('/rooms');
  };

  const isFormValid = (): boolean => {
    return formData.name.trim() !== '' && formData.maxPlayers > 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700 shadow-2xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="text-slate-300 hover:text-white hover:bg-slate-700/50 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Rooms
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-500" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent">
              CREATE NEW ROOM
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-center">
          {/* Room Configuration */}
          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-white">
                <Settings className="w-5 h-5 text-green-400" />
                Room Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Room Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4" />
                  Room Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter room name..."
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 
                           focus:border-orange-500 focus:ring-orange-500/20"
                  maxLength={30}
                />
                <p className="text-xs text-slate-500">
                  {formData.name.length}/30 characters
                </p>
              </div>

              {/* Max Players */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Maximum Players
                </label>
                <div className="flex gap-4 justify-center">
                  {[2, 4, 6].map((num) => (
                    <Button
                      key={num}
                      variant={formData.maxPlayers === num ? "default" : "outline"}
                      size="lg"
                      onClick={() => handleInputChange('maxPlayers', num)}
                      className={`${
                        formData.maxPlayers === num
                          ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/30'
                          : 'border-slate-600 text-slate-300 hover:border-orange-500/50 hover:bg-slate-700/50'
                      } px-8 py-3 text-lg font-bold transition-all duration-300 cursor-pointer`}
                    >
                      {num} Players
                    </Button>
                  ))}
                </div>
              </div>

              <Separator className="bg-slate-700" />

              {/* Create Room Button */}
              <div className="pt-4">
                <Button
                  size="lg"
                  onClick={handleCreateRoom}
                  disabled={!isFormValid() || isCreating}
                  className={`w-full ${
                    isFormValid()
                      ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg hover:shadow-green-500/30'
                      : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  } font-bold py-4 px-8 rounded-lg transition-all duration-300 ${
                    isFormValid() ? 'hover:scale-105' : ''
                  } gap-2 h-auto cursor-pointer`}
                >
                  {isCreating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      CREATING ROOM...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      CREATE ROOM
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;