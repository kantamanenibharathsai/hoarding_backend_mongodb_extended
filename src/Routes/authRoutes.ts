import { Router } from "express";
import {
  signUp,
  login,
  forgotPassword,
  changePassword,
} from "../Controllers/authControllers";
import { verifyToken } from "../Middlewares/authMiddlewares";
import {
  validateLogin,
  validateSignup,
  validateChangePassword,
  validateForgotPassword,
} from "../Validators/authValidator";
import { validateVerifyOtp } from "../Validators/otpValidators";
import { verifyOtp } from "../Controllers/otpControllers";
const route = Router();

route.post("/login", validateLogin, login);
route.post("/signUp", validateSignup, signUp);
route.post("/verifyOtp", validateVerifyOtp, verifyOtp);
route.post("/forgetPassword", validateForgotPassword, forgotPassword);
route.post(
  "/changePassword",
  verifyToken,
  validateChangePassword,
  changePassword
);

export default route;
