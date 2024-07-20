import { Router } from "express";
import {
  getPrivacyPolicy,
  deletePrivacyPolicy,
  updatePrivacyPolicy,
  getPrivacyPolicyByRole,
  createPrivacyPolicy,
} from "../Controllers/privacyPolicyController";
import upload from "../Config/multer";
const route = Router();

route.post("/", upload.single("file"), createPrivacyPolicy);
route.get("/", getPrivacyPolicy);
route.get("/role", getPrivacyPolicyByRole);
route.put("/:id", upload.single("file"), updatePrivacyPolicy);
route.delete("/:id", deletePrivacyPolicy);

export default route;
