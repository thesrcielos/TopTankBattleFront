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
