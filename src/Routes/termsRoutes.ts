import { Router } from "express";

import { verifyRoleAccess } from "../Middlewares/verifyRoleAccess";
import multer from "multer";
import { ADMIN } from "../helpers/constants";
import {
  getTerms,
  getTermsByRole,
  deleteTermsAndConditon,
  updateTermsAndCondtion,
  addTermsAndcondition,
} from "../Controllers/termsControllers";
const upload = multer();
const route = Router();

route.post(
  "/",
  verifyRoleAccess([ADMIN]),
  upload.single("file"),
  addTermsAndcondition
);
route.get("/", getTerms);
route.get("/role", verifyRoleAccess([ADMIN]), getTermsByRole);
route.delete("/:role", verifyRoleAccess([ADMIN]), deleteTermsAndConditon);
route.put("/:role", verifyRoleAccess([ADMIN]), updateTermsAndCondtion);

export default route;
