import { Request, Response } from "express";
import { uploadfiles } from "../helpers/cloudinaryUtils";
import fs from "fs";
import files from "../../tss.json";
import hoardingModel from "../Models/hoardingModel";
import {
  chatListModel,
  messageModel,
  userChatModel,
} from "../Models/messaging";

export async function dothis(req: Request, res: Response) {
  await hoardingModel.insertMany(files);
  console.log("done");
  res.send(req.body);
}

export async function testLogin(req: Request, res: Response) {
  const { name } = req.body;
  const userDoc = await userChatModel.findOne({ username: name });
  if (userDoc) {
    return res.json({ data: userDoc });
  }
  const user = await userChatModel.create({ username: name, chats: [] });
  await user.updateOne({ userid: user._id }, { upsert: true });
  return res.json({ data: { ...user, userId: user._id } });
}

export async function getAllChatUsers(req: Request, res: Response) {
  try {
    const data = await userChatModel.find({});
    return res.json(data);
  } catch (err) {}
}

export async function getAllMessages(req: Request, res: Response) {
  try {
    const userid = req.params.userid;
    const chatId = req.query.chatId;

    // original query
    // const query = {
    //   chatId : chatId,
    //   $or : [ {receiver : userid } ,{sender : userid}  ]
    // }
    //

    const messages = await messageModel.find({
      $or: [{ receiver: userid }, { sender: userid }],
    });
    return res.status(200).json(messages);
  } catch (err) {}
}

export async function addGroup(req: Request, res: Response) {
  try {
    const { groupName, userList } = req.body;
    const user = req.user;

    const objCreate = {
      isGroup: true,
      groupName,
      users: userList,
      admins: [user.id],
    };

    const group = await chatListModel.create(objCreate);
    return res.json(group);
  } catch (err) {
    return res.status(500).json(err);
  }
}

export async function getChatDetails(req: Request, res: Response) {
  try {
    const { sender, receiver } = req.query;
    const chatDoc = await chatListModel.findOne({
      "users.id": { $all: [sender, receiver] },
    });
    return res.json(chatDoc?.toObject());
  } catch (err) {
    return res.json({ err });
  }
}
