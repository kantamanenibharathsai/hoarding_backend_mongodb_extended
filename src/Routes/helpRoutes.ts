import { Router } from "express";
import {
  createHelp,
  deletehelpDoc,
  getAllQueries,
  answerQuery,
  getHelpById,
  updateQuery,
} from "../Controllers/helpControllers";
import { verifyRoleAccess } from "../Middlewares/verifyRoleAccess";
const route = Router();

route.get("/", getAllQueries);
route.get("/:id", getHelpById);
route.post("/", createHelp);
route.delete("/:id", deletehelpDoc);
route.put("/answer/:id", answerQuery);
route.put("/:id", updateQuery);

export default route;
