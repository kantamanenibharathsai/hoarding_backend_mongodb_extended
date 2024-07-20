import { Router } from "express";
import {
  getUser,
  getOwners,
  getCustomers,
  createOwner,
  changePassword,
  removeProfileImage,
} from "../Controllers/userControllers";
import route from "./authRoutes";
import multer from "multer";
import {
  validateCreateOwner,
  validateChangePassword,
  validateGetUser,
} from "../Validators/userValidators";
import { verifyRoleAccess } from "../Middlewares/verifyRoleAccess";
import { ADMIN, CUSTOMER, SALES, OWNER } from "../helpers/constants";
const upload = multer();

const router = Router();

// get all users
router.get("/");

//  not tested
router.get("/owners", verifyRoleAccess([ADMIN, SALES]), getOwners);

//  not testted
router.post(
  "/owner",
  verifyRoleAccess([SALES, ADMIN]),
  upload.array("file"),
  validateCreateOwner,
  createOwner
);
// // updateuser
// router.put("/:id");

//not tested
router.get("/customers", verifyRoleAccess([SALES, ADMIN]), getCustomers);

// may be unwanted route
// // customers/owener
// router.get("/customers/:ownerId");

//not tested
router.put("/changePassword", validateChangePassword, changePassword);
router.get("/:id", validateGetUser, getUser);
router.delete("/profilePhoto", removeProfileImage);

// write update user details api

export default router;
