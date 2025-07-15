import { create } from 'zustand';
export const useGameStore = create((set) => ({
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
    addPlayer: (player, team) => set((state) => {
        if (team === 1) {
            return { room: { ...state.room, team1: [...state.room.team1, player] } };
        }
        else {
            return { room: { ...state.room, team2: [...state.room.team2, player] } };
        }
    }),
    removePlayer: (playerId, host) => set((state) => ({
        room: {
            ...state.room,
            host: host,
            team1: state.room.team1.filter(p => p.id !== playerId),
            team2: state.room.team2.filter(p => p.id !== playerId),
        }
    })),
    removeKickedPlayer: (playerId) => set((state) => ({
        room: {
            ...state.room,
            team1: state.room.team1.filter(p => p.id !== playerId),
            team2: state.room.team2.filter(p => p.id !== playerId),
        }
    })),
    setRoom: (room) => set({ room: room }),
    setGame: (game) => set({ game: game }),
    setKicked: (playerId) => set((state) => ({
        kicked: state.room.team1.find(p => p.id === playerId) ||
            state.room.team2.find(p => p.id === playerId) ||
            undefined
    })),
    updatePlayerPosition: (move) => set((state) => {
        const existing = state.playerPositions[move.playerId];
        if (!existing ||
            existing.x !== move.position.x ||
            existing.y !== move.position.y ||
            existing.angle !== move.position.angle) {
            return {
                playerPositions: {
                    ...state.playerPositions,
                    [move.playerId]: move.position,
                }
            };
        }
        return {};
    }),
    addBullet: (id, position) => set((state) => ({
        playersBullets: { ...state.playersBullets, [id]: position }
    })),
    removeBullet: (id) => set((state) => {
        const newBullets = { ...state.playersBullets };
        delete newBullets[id];
        return { playersBullets: newBullets };
    }),
    addHit: (id, health) => set((state) => ({
        playerHits: { ...state.playerHits, [id]: health }
    })),
    removeHit: (id) => set((state) => {
        const newHits = { ...state.playerHits };
        delete newHits[id];
        return { playerHits: newHits };
    }),
    addDeadPlayer: (id) => set((state) => {
        const updated = new Set(state.deadPlayers);
        updated.add(id);
        return { deadPlayers: updated };
    }),
    removeDeadPlayer: (id) => set((state) => {
        const updated = new Set(state.deadPlayers);
        updated.delete(id);
        return { deadPlayers: updated };
    }),
    addRevivedPlayer: (id, position) => set((state) => ({
        revivedPlayers: { ...state.revivedPlayers, [id]: position }
    })),
    removeRevivedPlayer: (id) => set((state) => {
        const newPlayers = { ...state.revivedPlayers };
        delete newPlayers[id];
        return { revivedPlayers: newPlayers };
    }),
    addFortressHit: (id, health) => set((state) => ({
        fortressHits: { ...state.fortressHits, [id]: health }
    })),
    removeFortressHit: (id) => set((state) => {
        const newHits = { ...state.fortressHits };
        delete newHits[id];
        return { fortressHits: newHits };
    }),
    setGameOver: (team) => set((state) => ({
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
