import { notificationTypeT } from "../Models/notificationTypeModel";
import { Request, Response } from "express";
import notificationTypesModel from "../Models/notificationTypeModel";
import { removeSpaces } from "../helpers/helperFunc";
import userPreferenceModal from "../Models/userPreferences";
import { ADMIN } from "../helpers/constants";
import languageModel from "../Models/languageModel";
import { addDefaultuserPreferences } from "../Libray/userLibrary";
export async function addNotificationType(req: Request, res: Response) {
  try {
    const { name, description, role } = req.body;
    const shortName = removeSpaces(name);
    const data = await notificationTypesModel.findOne({
      shortName: shortName,
      role,
    });
    if (data)
      return res
        .status(400)
        .json({ message: "notification type with name already exists" });

    const objCreate = {
      name,
      description,
      role,
      shortName: shortName,
    };
    const notification = await notificationTypesModel.create(objCreate);
    return res.json({
      message: "notification type created",
      data: notification,
    });
  } catch (err) {
    return res.status(500).json(err);
  }
}

export async function getAllNotificationTypes(req: Request, res: Response) {
  try {
    const { role } = req.query;
    const user = req.user;

    if (role && typeof role === "string") {
      return res.json({
        data: await notificationTypesModel.find({ role: role.toUpperCase() }),
      });
    }
    return res.json({
      data: await notificationTypesModel.find({ role: user.role }),
    });
  } catch (err) {
    return res.status(500).json(err);
  }
}

export async function updateNotificationType(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const objUpdate: Partial<notificationTypeT> = {};
    if (name) {
      objUpdate.name = name;
      objUpdate.shortName = removeSpaces(name);
    }
    if (description) objUpdate.description = description;
    const notification = await notificationTypesModel.findOne({ _id: id });
    if (!notification)
      return res
        .status(400)
        .json({ message: "notification not found please check the id" });
    await notification.updateOne(objUpdate);
    const updatedNotification = await notificationTypesModel.findOne({
      _id: id,
    });
    return res.json({
      message: "notification type updated successfully",
      data: updatedNotification,
    });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function subscribeNotification(req: Request, res: Response) {
  try {
    const user = req.user;
    const { notificaionTypeId } = req.body;

    const notificaionType = await notificationTypesModel.findOne({
      _id: notificaionTypeId,
    });
    if (!notificaionType) {
      return res
        .status(400)
        .json({ message: "notification type doesn't exist" });
    }
    if (notificaionType.role !== user.role)
      return res
        .status(400)
        .json({ message: "notification type doesn't exist for your role" });
    let userPref = await userPreferenceModal.findOne({ userId: user.id });
    if (userPref === null) {
      userPref = await addDefaultuserPreferences(user.id);
    }
    if (userPref?.notifications.get(notificaionType.shortName) !== undefined) {
      return res
        .status(200)
        .json({ message: "you've already subscribed to this notification" });
    }
    userPref?.notifications.set(notificaionType.shortName, {
      id: notificaionType._id,
      status: true,
    });
    await userPref?.save();
    return res.json({ data: userPref });
  } catch (err) {
    return res.status(500).json({ err });
  }
}
