// should recieve a data

import notificationModel, { notificationT } from "../Models/notificationModel";
import { getUserById } from "./userLibrary";
import { Types, Schema } from "mongoose";
import { sendFcmNotification, notificationType } from "./fcmLib";

// data should contian userId , notificatindetails
export type sendNotificationType = {
  userId: Schema.Types.ObjectId;
  text: string;
  senderId?: Schema.Types.ObjectId;
  bookingId?: Schema.Types.ObjectId;
  title: string;
  image?: string;
};
export async function sendNotification(data: sendNotificationType) {
  try {
    const user = await getUserById(data.userId);

    const objCreate: Partial<notificationT> = {
      recipent: data.userId,
      message: data.text,
    };
    if (data.senderId !== undefined) {
      objCreate.sender = data.senderId;
    }
    if (data.bookingId) {
      objCreate.bookingId = data.bookingId;
    }
    await createNotification(objCreate);

    if (user?.fcmToken) {
      const notificaionData: notificationType = {
        title: data.title,
        body: data.text,
      };
      if (data.image) {
        notificaionData.image = data.image;
      }
      await sendFcmNotification(user?.fcmToken, notificaionData);
    }
    return Promise.resolve("notificaton sent");
  } catch (err) {
    return Promise.reject({ err });
  }
}

export async function updateNotification(params: any) {}

export async function createNotification(objCreate: object) {
  try {
    const notification = await notificationModel.create(objCreate);
    return Promise.resolve({ notification });
  } catch (err) {
    return Promise.reject({ err });
  }
}
