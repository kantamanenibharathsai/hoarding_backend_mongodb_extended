import { Router, Request, Response } from "express";
import {
  recentBookings,
  hoardingDetails,
  chartOrder,
} from "../Controllers/dashboardController";
import { verifyRoleAccess } from "../Middlewares/verifyRoleAccess";
import { ADMIN, OWNER } from "../helpers/constants";
const route = Router();
export default route;

route.get("/");

route.get("/chartOrder");
route.get("/bookings", verifyRoleAccess([ADMIN]), recentBookings);
route.get("/revenue", verifyRoleAccess([ADMIN]));
route.get("/hoardings", verifyRoleAccess([ADMIN]), hoardingDetails);
route.get("/chatOrder", verifyRoleAccess([ADMIN]), chartOrder);
