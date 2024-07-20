import { Router } from "express";

import { verifyRoleAccess } from "../Middlewares/verifyRoleAccess";
import { ADMIN, CUSTOMER, SALES, OWNER } from "../helpers/constants";
import {
  createSideMenu,
  addSideBar,
  deleteSideBar,
  deleteSideMenu,
  removeSideMenu,
  updateSidemenu,
  deleteTab,
  getSidebars,
  getSideMenu,
  addSideMenu,
} from "../Controllers/sideBarControllers";

import {
  validateUpdateSidemenu,
  validateAddSideBar,
  validateAddSideMenu,
  validateCreateSideMenu,
  validateDeleteTab,
  validateDeleteSideBar,
  validateDeleteSideMenu,
} from "../Validators/sidebarValidators";

const router = Router();

router.post("/", verifyRoleAccess([ADMIN]), validateAddSideBar, addSideBar);
router.post(
  "/sideMenu",
  verifyRoleAccess([ADMIN]),
  validateCreateSideMenu,
  createSideMenu
);
router.delete(
  "/:sideBarId",
  verifyRoleAccess([ADMIN]),
  validateDeleteSideBar,
  deleteSideBar
);
router.delete(
  "/sideMenu/:sidemenuId",
  verifyRoleAccess([ADMIN]),
  validateDeleteSideMenu,
  deleteSideMenu
);
router.put(
  "/removeSideMenu/:sideBarId",
  verifyRoleAccess([ADMIN]),
  removeSideMenu
);
router.put(
  "/addSideMenu",
  verifyRoleAccess([ADMIN]),
  validateAddSideMenu,
  addSideMenu
);
router.delete(
  "/deleteTab/:sideMenuId",
  verifyRoleAccess([ADMIN]),
  validateDeleteTab,
  deleteTab
);
router.get("/", getSidebars);
router.get("/sideMenu", getSideMenu);
router.put(
  "/sideMenu/:sideMenuId",
  verifyRoleAccess([ADMIN]),
  validateUpdateSidemenu,
  updateSidemenu
);
router.put("/:sideBarId");

// router.get("/owners", verifyRoleAccess([ADMIN, SALES]), getOwners);

export default router;
