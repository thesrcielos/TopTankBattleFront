import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Trophy, Target, TrendingUp, User, ArrowLeft } from 'lucide-react';
import { getUserStats } from '@/api/UserApi';
import { useUser } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface PlayerStats {
  username: string;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
}

interface PlayerStatsProps {
  player: PlayerStats;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

type PerformanceLevel = 'Elite Tank Commander' | 'Skilled Gunner' | 'Learning Recruit' | 'Rising Warrior';
type ExperienceLevel = 'Veteran' | 'Experienced' | 'Trained' | 'Rookie';

const PlayerStatsCard: React.FC<PlayerStatsProps> = ({ player }) => {
  const chartData: ChartData[] = [
    { name: 'Wins', value: player.wins, color: '#10b981' },
    { name: 'Losses', value: player.losses, color: '#ef4444' }
  ];

  const getPerformanceLevel = (winRate: number): PerformanceLevel => {
    if (winRate >= 70) return 'Elite Tank Commander';
    if (winRate >= 50) return 'Skilled Gunner';
    if (winRate >= 30) return 'Learning Recruit';
    return 'Rising Warrior';
  };

  const getExperienceLevel = (totalGames: number): ExperienceLevel => {
    if (totalGames >= 100) return 'Veteran';
    if (totalGames >= 50) return 'Experienced';
    if (totalGames >= 20) return 'Trained';
    return 'Rookie';
  };

  const getPerformanceColor = (winRate: number): string => {
    if (winRate >= 70) return 'text-green-400';
    if (winRate >= 50) return 'text-blue-400';
    if (winRate >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getExperienceColor = (totalGames: number): string => {
    if (totalGames >= 100) return 'text-purple-400';
    if (totalGames >= 50) return 'text-blue-400';
    if (totalGames >= 20) return 'text-green-400';
    return 'text-yellow-400';
  };

  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-slate-300">{data.value} games</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg">
            {player.username[0].toUpperCase()}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-lg">{player.username}</span>
            <span className='font-semibold text-purple-400 text-xs'>(You)</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 text-sm">My Stats</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left side - Stats */}
        <div className="space-y-4">
          {/* Total Games */}
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Games</p>
                <p className="text-white text-2xl font-bold">{player.totalGames}</p>
              </div>
            </div>
          </div>

          {/* Win Rate */}
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Win Rate</p>
                <p className="text-white text-2xl font-bold">{player.winRate}%</p>
              </div>
            </div>
          </div>

          {/* Wins vs Losses */}
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">W/L Record</p>
                <p className="text-white text-xl font-bold">
                  <span className="text-green-400">{player.wins}</span>
                  <span className="text-slate-500 mx-1">/</span>
                  <span className="text-red-400">{player.losses}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Chart */}
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-4 text-center">Win/Loss Distribution</h3>
          {player.totalGames > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#374151"
                  >
                    {chartData.map((entry: ChartData, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value: string, entry: any) => (
                      <span style={{ color: entry.color }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <Target className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">No games played yet</p>
                <p className="text-slate-500 text-sm">Start playing to see stats!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Performance Indicator */}
      <div className="mt-6 p-4 bg-gradient-to-r from-slate-700/30 to-slate-800/30 border border-slate-600 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Performance Level</p>
            <p className="text-white font-semibold">
              {player.winRate >= 70 ? (
                <span className="text-green-400">🔥 Elite Tank Commander</span>
              ) : player.winRate >= 50 ? (
                <span className="text-blue-400">⚡ Skilled Gunner</span>
              ) : player.winRate >= 30 ? (
                <span className="text-yellow-400">🎯 Learning Recruit</span>
              ) : (
                <span className="text-red-400">🚀 Rising Warrior</span>
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">Battle Experience</p>
            <p className="text-white font-semibold">
              {player.totalGames >= 100 ? (
                <span className="text-purple-400">Veteran</span>
              ) : player.totalGames >= 50 ? (
                <span className="text-blue-400">Experienced</span>
              ) : player.totalGames >= 20 ? (
                <span className="text-green-400">Trained</span>
              ) : (
                <span className="text-yellow-400">Rookie</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Single Player Statistics Component
const PlayerStatsPage: React.FC = () => {
  const [playerStats, setStats] = useState<PlayerStats | null>(null);
  const {userId} = useUser();
  const navigate = useNavigate();
  const fetchStats = async () => {
    try{
        const data = await getUserStats(userId || "");
        setStats(data);
    }catch(error: any){
        if (error.response) {
            const msg = error.response.status >= 500 ? "Server Error, try again later." : error.response.data;
            toast.error(msg)
          } else {
            toast.error("Server error, try again later.")
          }
    }
  }
  useEffect(() => {
    fetchStats();
  }, [])

  const handleReturn = () => {
    navigate("/rooms");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
           <button
            onClick={handleReturn}
            className="text-slate-300 hover:text-white hover:bg-slate-700/50 p-1 rounded cursor-pointer"
            >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent">My Statistics</h1>
          <p className="text-slate-400">Your Tank Battle Performance Overview</p>
        </div>

        {/* Single Player Stats Card */}
        {playerStats && (<PlayerStatsCard player={playerStats} />)
        }
      </div>
    </div>
  );
};

export default PlayerStatsPage;