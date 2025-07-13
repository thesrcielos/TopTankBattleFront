import { useGameStore } from "@/store/Store";

let socket: WebSocket | null = null;
let retryAttempts = 0;

export function connectToWebSocket(token: string) {
  if(socket?.OPEN) return;
  socket = new WebSocket(`ws://localhost:8080/game?token=${token}`);

  socket.onopen = () => {
    console.log("✅ Connected WebSocket");
    retryAttempts = 0;
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Received messsage", data);
    const payload = data.payload;
    console.log(payload);
    if (data.type === "ROOM_JOIN") {
      useGameStore.getState().addPlayer(payload.player, payload.team)
    }else if(data.type === "ROOM_LEAVE"){
      useGameStore.getState().removePlayer(payload.player, payload.host)
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
    }
  };

  socket.onclose = () => {
    console.warn("🔌 WS closed, retrying...");
    retryAttempts++;
    const delay = Math.min(1000 * 2 ** retryAttempts, 15000); // Max 15s
    setTimeout(() => connectToWebSocket(token), delay);
  };

  socket.onerror = (error) => {
    console.error("❌ Error", error);
  };
}

export function disconnectWS() {
  socket?.close();
}

export function sendMessage(message: string) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(message);
  } else {
    console.warn("Message not sent, websocket not connected");
  }
}

