export default async function gameWebsocket(fastify){
   fastify.get("/ws/game",{ websocket: true }, (connection, req) => {
    console.log("Player connected");

    connection.socket.on("message", message => {
      console.log("Received:", message.toString());
     //Echo back (for testing)
     ws.onopen = () => {
      connection.socket.send(
        JSON.stringify({ type: "pong" })
      );}
    });

    connection.socket.on("close", () => {
      console.log("Player disconnected");
    });
  });
}