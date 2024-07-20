import { Router } from "express";
import {
  getAllFeatures,
  getFeatureById,
  deleteFeature,
  updateFeature,
  addFeature,
} from "../Controllers/featureControlller";
import { verifyRoleAccess } from "../Middlewares/verifyRoleAccess";
import { ADMIN, OWNER, SALES } from "../helpers/constants";
const route = Router();

route.get("/", getAllFeatures);
route.get("/:id", getFeatureById);
route.post("/", verifyRoleAccess([ADMIN, OWNER]), addFeature);
route.put("/:id", verifyRoleAccess([ADMIN, OWNER, SALES]), updateFeature);
route.delete("/:id", verifyRoleAccess([ADMIN, OWNER]), deleteFeature);

export default route;
