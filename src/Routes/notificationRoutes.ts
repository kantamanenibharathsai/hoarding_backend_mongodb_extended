import { Router } from "express";
import {
  getNotifications,
  deleteNotification,
  getNotificatonDetails,
  readNotification,
  getUnreadNotifications,
} from "../Controllers/notificationController";
const route = Router();

// not used once
// add validations

route.get("/", getNotifications);
route.get("/newNotifications", getUnreadNotifications);
route.delete("/:notificatonId", deleteNotification);
route.put("/:notificatonId");
route.get("/:notificatonId", getNotificatonDetails);
route.put("/readNotification", readNotification);

export default route;
