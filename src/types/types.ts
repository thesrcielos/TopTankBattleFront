export interface Player {
    id: string;
    username: string;
}

type Status = "LOBBY" | "PLAYING";
export interface RoomCreate {
    name: string;
    capacity: number;    
    player: number;
}

export interface Room {
    id: string;
    name: string;
    capacity: number;
    players: number;
    host: Player;
    team1: Player[];
    team2: Player[];
    status: Status;
}

export interface Game {
    timestamp: number,
    players: { [key: string]: PlayerState };
    bullets: { [key: string]: Bullet };
}

export interface PlayerState {
    id: string;
    position: Position;
    health: number;
    team1: boolean;
}

export interface Bullet {
    position: Position;
    speed: number;
    ownerId: string;
}

export interface PlayerBullet {
    position: Position;
    team1: boolean;
    ownerId: string;
}

export interface Position {
    x: number
    y: number
    angle: number
}

export interface PlayerPosition{
    playerId: string;
    position: Position;
    targetPosition?: Position;
}
