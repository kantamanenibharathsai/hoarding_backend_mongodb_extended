import http from "http";
import { config } from "dotenv";
config();
import { Server } from "socket.io";
import client from "./Config/redisConfig";
import connectDb from "./Config/dbConfig";
import startCrons from "./Services/crons";
import app from "./app";
const PORT = 8080;
const httpServer = http.createServer(app);
import { handleSockets } from "./helpers/handleSockets";

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(socket.id, "connected");

  handleSockets(socket, io);
  socket.emit("connected", { socketId: socket.id });
});

async function startServer() {
  try {
    await connectDb();
    await client.connect();
    httpServer.listen(PORT, () => {
      console.log(`listening on port ${PORT} 🔥🔥🔥🔥🔥🔥🔥`);
      startCrons();
    });
  } catch (err) {
    console.log(err);
    process.exit();
  }
}

startServer();

client.on("error", (err) => {
  console.log("redis error ", err);
});
