import { useGameStore } from "@/store/Store";

let socket: WebSocket | null = null;

export function connectToWebSocket(token: string) {
  if(socket?.OPEN) return;
  socket = new WebSocket(`ws://localhost:8080/game?token=${token}`);

  socket.onopen = () => {
    console.log("✅ Connected WebSocket");
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
    }
  };

  socket.onclose = () => {
    console.log("🔌 Conexión cerrada");
  };

  socket.onerror = (error) => {
    console.error("❌ Error en WebSocket", error);
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

