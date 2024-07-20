import { Router } from "express";
import {
  addCategory,
  deleteCategory,
  updateCategoryDoc,
  getCategoryList,
} from "../Controllers/categoryController";
import { verifyRoleAccess } from "../Middlewares/verifyRoleAccess";
import { ADMIN } from "../helpers/constants";
const route = Router();

route.get("/", getCategoryList);

route.post("/", verifyRoleAccess([ADMIN]), addCategory);
route.delete("/:id", verifyRoleAccess([ADMIN]), deleteCategory);
route.put("/:id", verifyRoleAccess([ADMIN]), updateCategoryDoc);

export default route;
