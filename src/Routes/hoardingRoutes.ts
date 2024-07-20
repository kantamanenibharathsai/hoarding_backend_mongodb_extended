import { NextFunction, Router, Request, Response } from "express";
import {
  addHoarding,
  getHoarding,
  removeHoarding,
  getHoardingsByOwner,
  disableHoarding,
  enableHoarding,
  getMyHoardings,
  addRecentlyViewed,
  getRecentHoardings,
  topHoardings,
  searchHoardings,
} from "../Controllers/hoardingControllers";
import {
  validateGetHoarding,
  validateAddHoarding,
  validategetHoardingsByOwner,
  validateDisableHoarding,
  validateremoveHoarding,
} from "../Validators/hoardingValidators";
import multer from "multer";
import { verifyRoleAccess } from "../Middlewares/verifyRoleAccess";
import { ADMIN, CUSTOMER, SALES, OWNER } from "../helpers/constants";
const upload = multer();
const route = Router();

route.post(
  "/",
  verifyRoleAccess([ADMIN, OWNER, SALES]),
  upload.array("files"),
  validateAddHoarding,
  addHoarding
);
route.get("/myHoardings", verifyRoleAccess([OWNER]), getMyHoardings);
route.get("/top", topHoardings);
route.post("/recentlyViewed", verifyRoleAccess([CUSTOMER]), addRecentlyViewed);
route.get("/recentlyViewed", verifyRoleAccess([CUSTOMER]), getRecentHoardings);
// delete image
route.delete("/deleteImages/:id");
route.get("/search", searchHoardings);

route.get("/:id", validateGetHoarding, getHoarding);
route.delete(
  "/:id",
  verifyRoleAccess([ADMIN, OWNER, SALES]),
  validateremoveHoarding,
  removeHoarding
);
route.get(
  "/getHoardingByOwner/:ownerId",
  verifyRoleAccess([ADMIN, SALES]),
  validategetHoardingsByOwner,
  getHoardingsByOwner
);

route.get("/allOwners", verifyRoleAccess([ADMIN, SALES]));
route.put(
  "/disableHoarding/:hoardingId",
  verifyRoleAccess([ADMIN, OWNER, SALES]),
  validateDisableHoarding,
  disableHoarding
);
route.put(
  "/enableHoarding/:hoardingId",
  verifyRoleAccess([ADMIN, OWNER, SALES]),
  validateDisableHoarding,
  enableHoarding
);

// update hoarding
//search hoardings
// availability

export default route;
