import {
  getNotificationById,
  updateNotification,
  getNotificationsByQuery,
  deleteNotioficaitonById,
} from "../Libray/notificationLibary";
import { Request, Response } from "express";
import { ADMIN } from "../helpers/constants";
export async function getNotifications(req: Request, res: Response) {
  try {
    const user = req.user;
    const query = {
      recipent: user.id,
    };
    const notifications = await getNotificationsByQuery(query);
    return res.json({ data: notifications });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function getUnreadNotifications(req: Request, res: Response) {
  try {
    const user = req.user;
    const query = {
      recipent: user.id,
      read: false,
    };
    const notifications = await getNotificationsByQuery(query);
    return res.json({ data: notifications });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function getNotificatonDetails(req: Request, res: Response) {
  try {
    const { notificatonId } = req.params;
    const notification = await getNotificationById(notificatonId);
    if (notification === null) {
      return res.status(400).json({ message: "notificaiton not found" });
    }
    return res.json({ data: notification });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function deleteNotification(req: Request, res: Response) {
  try {
    const { notificatonId } = req.params;
    const user = req.user;

    const notificaiton = await getNotificationById(notificatonId);
    if (notificaiton === null) {
      return res.status(500).json({ message: "notification Not found" });
    }
    if (notificaiton.recipent.toString() !== user.id && user.role !== ADMIN) {
      return res.status(401).json({
        message: "you do not have permission to delete this notificaion",
      });
    }
    await deleteNotioficaitonById(notificatonId);
    return res.json({ message: "deleted notification successfully" });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function readNotification(req: Request, res: Response) {
  try {
    const { notificationId } = req.body;
    const query = {
      _id: notificationId,
    };
    const objUpdate = {
      read: true,
    };
    await updateNotification(query, objUpdate);
    const updatedNotification = await getNotificationById(notificationId);
    return res.json({
      message: "updated notification ",
      data: updatedNotification,
    });
  } catch (err) {
    return res.status(500).json({ err });
  }
}
