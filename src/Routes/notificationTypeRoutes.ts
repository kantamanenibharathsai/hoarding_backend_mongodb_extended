import { Router } from "express";
import {
  addNotificationType,
  updateNotificationType,
  getAllNotificationTypes,
  subscribeNotification,
} from "../Controllers/notificationTypeController";
import { verifyRoleAccess } from "../Middlewares/verifyRoleAccess";
import { ADMIN } from "../helpers/constants";
const route = Router();

route.post("/subscribeNotification", subscribeNotification);
route.post("/", verifyRoleAccess([ADMIN]), addNotificationType);

route.get("/", getAllNotificationTypes);

route.put("/:id", verifyRoleAccess([ADMIN]), updateNotificationType);

export default route;
