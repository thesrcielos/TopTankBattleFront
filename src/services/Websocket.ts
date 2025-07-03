let socket: WebSocket | null = null;
let messageCallback: ((data: any) => void) | null = null;

export function connectToWebSocket(playerId: string) {
  socket = new WebSocket("ws://localhost:8080/game");

  socket.onopen = () => {
    console.log("✅ Connected WebSocket");

    socket?.send(playerId);
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("📨 Mensaje recibido:", data);

    if (data.type === "MESSAGE") {
      console.log("💬 Mensaje del chat:", data.payload);
    }
  };

  socket.onclose = () => {
    console.log("🔌 Conexión cerrada");
  };

  socket.onerror = (error) => {
    console.error("❌ Error en WebSocket", error);
  };
}

export function sendMessage(message: string) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(message);
  } else {
    console.warn("Message not sent, websocket not connected");
  }
}
