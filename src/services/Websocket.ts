import { useGameStore } from "@/store/Store";

let socket: WebSocket | null = null;
let retryAttempts = 0;
const WSUrl = import.meta.env.VITE_WEBSOCKET_URL;
let closed = false;

export function connectToWebSocket(token: string) {
  if(socket && socket.readyState === WebSocket.OPEN) return;
  socket = new WebSocket(`${WSUrl}?token=${token}`);
  closed = false
  socket.onopen = () => {
    console.log("✅ Connected WebSocket");
    closed = false
    retryAttempts = 0;
    setInterval(() => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(data);
    const payload = data.payload;
    if (data.type === "ROOM_JOIN") {
      useGameStore.getState().addPlayer(payload.player, payload.team)
    }else if(data.type === "ROOM_LEAVE"){
      useGameStore.getState().removePlayer(payload.player, payload.host)
    }else if(data.type === "ROOM_INFO"){
      useGameStore.getState().setRoom(payload)
    }else if(data.type === "ROOM_KICK"){
      useGameStore.getState().setKicked(payload.kicked);
      useGameStore.getState().removeKickedPlayer(payload.kicked)
    }else if(data.type === "GAME_START"){
      useGameStore.getState().setGame(payload);
    }else if(data.type === "MOVE"){
      useGameStore.getState().updatePlayerPosition(payload);
    }else if(data.type === "SHOOT"){
      useGameStore.getState().addBullet(payload.id, payload)
    }else if(data.type === "PLAYER_HIT"){
      useGameStore.getState().addHit(data.payload.playerId, data.payload.health);
    }else if(data.type === "PLAYER_KILLED"){
      useGameStore.getState().addDeadPlayer(payload.playerId);
    }else if(data.type === "PLAYER_REVIVED"){
      useGameStore.getState().addRevivedPlayer(payload.playerId, payload.position);
    }else if(data.type === "FORTRESS_HIT"){
      const id = payload.team1 ? 1: 2;
      useGameStore.getState().addFortressHit(id, payload.health);
    }else if(data.type === "GAME_OVER"){
      useGameStore.getState().setGameOver(payload.team1 ? 1 : 2);
    }
  };

  socket.onclose = () => {
    if(closed) return;
    console.log(closed);
    console.warn("🔌 WS closed, retrying...");
    retryAttempts++;
    const delay = Math.min(1000 * 2 ** retryAttempts, 10000); // Max 10s
    setTimeout(() => {
      if(socket || !closed){
        connectToWebSocket(token)
      }
  }, delay);
  };

  socket.onerror = (error) => {
    console.error("❌ Error", error);
  };
}

export function disconnectWS() {
  console.log("Closing connection")
  closed = true;
  socket?.close();
  socket = null;
}

export function sendMessage(message: string) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(message);
  } else {
    console.warn("Message not sent, websocket not connected");
  }
}

