import { create } from 'zustand';
import { Player, Room } from '@/types/types';

interface GameStore {
    room: Room;
    messages: string[];
    canStartGame: boolean;
    addPlayerTeam1: (player: Player) => void;
    addPlayerTeam2: (player: Player) => void;
    removePlayerTeam1: (player: Player) => void;
    removePlayerTeam2: (player: Player) => void;
    setRoom: (room: Room) => void;
    addMessage: (message: string) => void;
    setCanStartGame: (canStartGame: boolean) => void;
    clearMessages: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
    room: {
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
    },
    messages: [],
    canStartGame: false,
    addPlayerTeam1: (player: Player) => set(
        (state) => (
            { room: { ...state.room, team1: [...state.room.team1, player] } 
        })),
    addPlayerTeam2: (player: Player) => set((state) => ({ room: { ...state.room, team2: [...state.room.team2, player] } })),
    removePlayerTeam1: (player: Player) => set((state) => ({ room: { ...state.room, team1: state.room.team1.filter(p => p.id !== player.id) } })),
    removePlayerTeam2: (player: Player) => set((state) => ({ room: { ...state.room, team2: state.room.team2.filter(p => p.id !== player.id) } })),
    setRoom: (room: Room) => set({ room: room }),
    addMessage: (message: string) =>
      set((state) => ({ messages: [...state.messages, message] })),
    clearMessages: () => set({ messages: [] }), 
    setCanStartGame: (canStartGame: boolean) => set({ canStartGame: canStartGame }),
  }));