import { Socket, Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import client from "../Config/redisConfig";
import { database } from "firebase-admin";
import {
  messageModel,
  chatListModel,
  userChatModel,
} from "../Models/messaging";

type socketT = typeof Socket;

type joinPayloadData = {
  roomId: string;
};
type messageData = {
  sender: string;
  reciever: string;
  roomId: string;
  message: string;
  chatId: string;
  chatList: string[];
};

export function handleSockets(
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  socket.on("message", async (messageData: messageData) => {
    try {
      const userDetails = await client.hGetAll(messageData.reciever);
      // he is online
      if (userDetails) {
        const userData = userDetails;
        const socketId = userData.socketId;
        console.log(io.sockets.sockets.get(socketId));

        io.sockets.sockets
          .get(socketId)
          ?.emit("recieveMessage", { messageData });
      }
      //save in the database;
      saveMessage(messageData);
      checkAndUpdateChatList(messageData);
    } catch (err) {
      console.log("in messages event", err);
    }
  });

  socket.on("join", async (data) => {
    console.log("joining room", data);
    await socket.join(data.roomId);
    socket.emit("onJoin", { message: "joined in room" });
  });

  socket.on("groupMessage", (data: messageData) => {
    io.to(data.roomId).emit("recieveGroupMessage", data);
    saveGroupMessage(data);
  });

  socket.on("ping", async (data) => {
    try {
      if (data && data.userid) {
        // console.log("pinged ", data.userid);
        await client.hSet(data.userid, "socketId", socket.id);
        const val = await client.hGetAll(data.userid, "socketId");

        // client.expire(data.userid, 20);
      }
    } catch (err) {
      console.log("in ping statement", err);
    }
  });
}

async function saveMessage(data: messageData) {
  try {
    await messageModel.create({
      sender: data.sender,
      receiver: data.reciever,
      chatListId: data.chatId,
      isGroupMsg: false,
    });
  } catch (err) {
    console.log(err);
  }
}

async function checkAndUpdateChatList(data: messageData) {
  try {
    if (!data.chatList.includes(data.chatId)) {
      const senderPrm = userChatModel.findOne({ _id: data.sender });
      const reciverPrm = userChatModel.findOne({ _id: data.reciever });
      const [sender, receiver] = await Promise.all([senderPrm, reciverPrm]);

      await chatListModel.create({
        users: [
          { name: sender?.username, id: sender?.userid },
          { name: receiver?.username, id: receiver?.userid },
        ],
      });
    }
  } catch (err) {
    console.log(err);
  }
}

async function saveGroupMessage(data: messageData) {
  try {
    await messageModel.create({
      sender: data.sender,
      chatListId: data.chatId,
      isGroupMsg: true,
    });
  } catch (err) {}
}
