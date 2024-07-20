import mongoose, { model, Schema } from "mongoose";

type chatListUser = {
  id: string;
  name: string;
};

type chatlist = {
  id: string;
  isGroup: boolean;
  groupName: string;
  admins: string[];
  users: chatListUser[];
};
type messages = {
  sender: string;
  receiver: string;
  isGroupMsg: boolean;
  chatListId: string;
  read: boolean;
};
type userChat = {
  userid: string;
  username: string;
  recentMessages: messages[];
  chats: chatlist[];
};

const chatlistSchema = new Schema<chatlist>({
  isGroup: Boolean,
  groupName: String,
  users: [{ name: String, id: String }],
  admins: [{ id: String, name: String }],
});
export const chatListModel = model<chatlist>("chatList", chatlistSchema);

const userChatSchema = new Schema<userChat>({
  userid: String,
  username: String,
  chats: [{ type: Schema.Types.ObjectId, ref: "chatList" }],
});
export const userChatModel = model("userChat", userChatSchema);

const messageSchema = new Schema<messages>({
  sender: String,
  receiver: String,
  chatListId: String,
  isGroupMsg: Boolean,
  read: Boolean,
});
export const messageModel = model("message", messageSchema);
