import { Router } from "express";

import { verifyRoleAccess } from "../Middlewares/verifyRoleAccess";
import { ADMIN, CUSTOMER, SALES, OWNER } from "../helpers/constants";
import {
  updateTicket,
  getTickets,
  removeTicket,
  addTicket,
} from "../Controllers/ticketControllers";

const route = Router();

route.post("/", addTicket);
route.get("/search", verifyRoleAccess([ADMIN, OWNER]), getTickets);
route.put(
  "/:ticketId",
  verifyRoleAccess([ADMIN, OWNER, CUSTOMER]),
  updateTicket
);
route.delete("/:ticketId", verifyRoleAccess([ADMIN, OWNER]), removeTicket);
export default route;
