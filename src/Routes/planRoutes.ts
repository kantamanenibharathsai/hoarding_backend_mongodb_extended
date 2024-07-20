import { Router } from "express";
import {
  deletePlan,
  addPlan,
  getPlans,
  togglePlanStatus,
  updatePlan,
} from "../Controllers/planController";
import {
  validateCreatePlan,
  validateDeletePlan,
  validateTogglePlanStatus,
  validateUpdatePlan,
} from "../Validators/planValidators";
import { verifyRoleAccess } from "../Middlewares/verifyRoleAccess";
import { ADMIN, CUSTOMER } from "../helpers/constants";
const route = Router();

route.post("/", verifyRoleAccess([ADMIN]), validateCreatePlan, addPlan);
route.delete(
  "/:planId",
  verifyRoleAccess([ADMIN]),
  validateDeletePlan,
  deletePlan
);
route.get("/", getPlans);
route.put(
  "/:planId",
  verifyRoleAccess([ADMIN]),
  validateUpdatePlan,
  updatePlan
);
route.put(
  "/toggleState/:planId",
  verifyRoleAccess([ADMIN]),
  validateTogglePlanStatus,
  togglePlanStatus
);

//get all plans
// get plan by id
export default route;
