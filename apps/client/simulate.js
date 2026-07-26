const { io } = require("socket.io-client");

const socket = io("http://localhost:3333", {
  transports: ["websocket"]
});

const ORDER_ID = "123";

socket.on("connect", () => {
  console.log("Simulador do Provedor Conectado:", socket.id);
  
  let lat = -23.55052;
  let lng = -46.633309;

  setInterval(() => {
    lat += (Math.random() - 0.5) * 0.001;
    lng += (Math.random() - 0.5) * 0.001;
    
    console.log(`Enviando localizacao: Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`);
    socket.emit("updateLocation", {
      orderId: ORDER_ID,
      lat,
      lng,
      heading: 0
    });
  }, 2000);
});

socket.on("connect_error", (err) => {
  console.log("Erro de conexão:", err.message);
});
