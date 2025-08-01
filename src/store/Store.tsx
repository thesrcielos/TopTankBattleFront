import { create } from 'zustand';
import { Player, Room, Game, PlayerPosition, Position, PlayerBullet } from '@/types/types';

interface GameStore {
    room: Room;
    game: Game | undefined;
    kicked: Player | undefined;
    playerPositions: Record<string, Position>;
    playersBullets: Record<string, PlayerBullet>;
    playerHits: Record<string, number>;
    deadPlayers: Set<string>;
    revivedPlayers: Record<string, Position>;
    fortressHits: Record<number, number>;
    gameOver: number | undefined;
    addPlayer: (player: Player, team: number) => void;
    removePlayer: (playerId: string, host: Player) => void;
    removeKickedPlayer: (playerId: string) => void;
    setRoom: (room: Room) => void;
    setGame: (game: Game | undefined) => void;
    setKicked: (playerId: string) => void;
    updatePlayerPosition: (move: PlayerPosition) => void;
    addBullet: (id: string,  pos: PlayerBullet) => void;
    removeBullet: (id: string) => void;
    addHit: (id: string, health: number) => void;
    removeHit: (id: string) => void;
    addDeadPlayer: (id: string) => void;
    removeDeadPlayer: (id: string) => void;
    addRevivedPlayer: (id: string, position: Position) => void;
    removeRevivedPlayer: (id: string) => void;
    addFortressHit: (id: number, health: number) => void;
    removeFortressHit: (id: number) => void;
    setGameOver: (team: number) => void;
    clearGameOver: () => void;
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
    kicked: undefined,
    game: undefined,
    playerPositions: {},
    playersBullets: {},
    playerHits: {},
    deadPlayers: new Set(),
    revivedPlayers: {},
    fortressHits: {},
    gameOver: undefined,
    addPlayer: (player: Player, team: number) => set((state) => {
        if (team === 1) {
            return { room: { ...state.room, team1: [...state.room.team1, player] } };
        } else {
            return { room: { ...state.room, team2: [...state.room.team2, player] } };
        }
    }),

    removePlayer: (playerId: string, host: Player) => set((state) => ({
        room: {
            ...state.room,
            host: host,
            team1: state.room.team1.filter(p => p.id !== playerId),
            team2: state.room.team2.filter(p => p.id !== playerId),
        }
    })),

    removeKickedPlayer: (playerId: string) => set((state) => ({
        room: {
            ...state.room,
            team1: state.room.team1.filter(p => p.id !== playerId),
            team2: state.room.team2.filter(p => p.id !== playerId),
        }
    })),

    setRoom: (room: Room) => set({ room: room }),


    setGame: (game: Game | undefined) => set({ game: game }),

    setKicked: (playerId: string) => set((state) => ({
        kicked: state.room.team1.find(p => p.id === playerId) ||
                state.room.team2.find(p => p.id === playerId) ||
                undefined
    })),

    updatePlayerPosition: (move: PlayerPosition) => set((state) => {
        const existing = state.playerPositions[move.playerId];
        if (
            !existing ||
            existing.x !== move.position.x ||
            existing.y !== move.position.y ||
            existing.angle !== move.position.angle
        ) {
            return {
                playerPositions: {
                    ...state.playerPositions,
                    [move.playerId]: move.position,
                }
            };
        }
        return {};
    }),

    addBullet: (id: string, position: PlayerBullet) => set((state) => ({
        playersBullets: {...state.playersBullets, [id]: position}
    })),

    removeBullet: (id: string) =>
        set((state) => {
          const newBullets = { ...state.playersBullets };
          delete newBullets[id];
          return { playersBullets: newBullets };
    }),

    addHit: (id: string, health: number) => set((state) => ({
        playerHits: {...state.playerHits, [id]: health}
    })),

    removeHit: (id: string) => set((state) => {
        const newHits = { ...state.playerHits };
        delete newHits[id];
        return { playerHits: newHits };
  }),

  addDeadPlayer: (id: string) =>
    set((state) => {
      const updated = new Set(state.deadPlayers);
      updated.add(id);
      return { deadPlayers: updated };
    }),
  removeDeadPlayer: (id: string) =>
    set((state) => {
      const updated = new Set(state.deadPlayers);
      updated.delete(id);
      return { deadPlayers: updated };
    }),

    addRevivedPlayer: (id: string, position: Position) =>
        set((state) => ({
          revivedPlayers: {...state.revivedPlayers, [id]: position}
        })),
      removeRevivedPlayer: (id: string) =>
        set((state) => {
            const newPlayers = { ...state.revivedPlayers };
            delete newPlayers[id];
            return { revivedPlayers: newPlayers };
        }),
    addFortressHit: (id: number, health: number) => set((state) => ({
            fortressHits: {...state.fortressHits, [id]: health}
        })),
    
    removeFortressHit: (id: number) => set((state) => {
            const newHits = { ...state.fortressHits };
            delete newHits[id];
            return { fortressHits: newHits };
    }),
    setGameOver: (team: number) => set((state) => ({
        gameOver: team,
    })),
    clearGameOver: () => set((state) => ({
        gameOver: undefined,
        game: undefined,
        playerHits: {},
        playerPositions: {},
        playersBullets: {},
        revivedPlayers: {},
        deadPlayers: new Set(),
        fortressHits: {},
    })),
}));
