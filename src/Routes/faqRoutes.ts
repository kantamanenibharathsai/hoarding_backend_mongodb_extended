import { Router } from "express";
import {
  addFaqQuery,
  deleteFaq,
  updateFaq,
  getAllFaqs,
  getFaqQuery,
  searchFaqs,
} from "../Controllers/faqController";
import { verifyRoleAccess } from "../Middlewares/verifyRoleAccess";
import { ADMIN } from "../helpers/constants";
const route = Router();

route.get("/", getAllFaqs);
route.get("/:id", getFaqQuery);
route.post("/", verifyRoleAccess([ADMIN]), addFaqQuery);
route.delete("/:id", verifyRoleAccess([ADMIN]), deleteFaq);
route.put("/:id", verifyRoleAccess([ADMIN]), updateFaq);
route.get("/search", searchFaqs);

export default route;
