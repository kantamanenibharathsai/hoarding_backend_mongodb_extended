import mongoose from "mongoose";
import notificationModel, { notificationT } from "../Models/notificationModel";

export async function createNotification(objCreate: Partial<notificationT>) {
  try {
    const notification = await notificationModel.create(objCreate);
    return Promise.resolve(notification);
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function getNotificationsByQuery(
  query: object,
  limit = 10,
  page = 1
) {
  try {
    const notifications = await notificationModel
      .find(query)
      .limit(limit)
      .skip((page - 1) * limit);
    return Promise.resolve(notifications);
  } catch (err) {
    Promise.reject(err);
  }
}

export async function getNotificationById(notificationId: string) {
  try {
    const notification = await notificationModel.findOne({
      _id: notificationId,
    });
    return Promise.resolve(notification);
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function deleteNotioficaitonById(notificationId: string) {
  try {
    await notificationModel.deleteOne({ _id: notificationId });
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function updateNotification(query: object, objCreate: object) {
  try {
    await notificationModel.updateOne(query, objCreate);
    Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}
