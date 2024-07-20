import { Router } from "express";
import {
  addLanguage,
  deleteLanguage,
  getAllLanguages,
  updateLanguage,
} from "../Controllers/languageControllers";
import { verifyRoleAccess } from "../Middlewares/verifyRoleAccess";
import { ADMIN } from "../helpers/constants";
const route = Router();

route.post("/", verifyRoleAccess([ADMIN]), addLanguage);

route.get("/", getAllLanguages);

route.put("/:id", updateLanguage);
route.delete("/:id", deleteLanguage);

export default route;
