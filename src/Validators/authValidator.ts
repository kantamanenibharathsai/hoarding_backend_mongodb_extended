import { NextFunction, Request, Response } from "express";
import { isString, validEmail } from "../helpers/validateutils";
import { ErrorT } from "../types/customTypes";
export async function validateSignup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { fullName, email, password, role, phNumber } = req.body;
  const Errors = [];
  if (!fullName) {
    Errors.push({ message: "fullName field is empty" });
  }
  if (fullName && !isString(fullName)) {
    Errors.push({ message: "fullName is not a string" });
  }
  if (!email) {
    Errors.push({ message: "email field is empty" });
  }
  if (email && !isString(email)) {
    Errors.push({ message: "email is not a string" });
  }
  if (email && !validEmail(email)) {
    Errors.push({ message: "invalid email structure" });
  }
  if (!password) {
    Errors.push({ message: "password field is empty" });
  }
  if (password && !isString(password)) {
    Errors.push({ message: "password is not a string" });
  }
  if (!role) {
    Errors.push({ message: "role field is empty" });
  }
  if (role && !isString(role)) {
    Errors.push({ message: "role is not a string" });
  }
  // if (
  //   role &&
  //   ["OWNER", "SALES", "CUSTOMER"].find((item) => item === role) === undefined
  // ) {
  //   Errors.push({ message: "invalid role" });
  // }
  if (!phNumber) {
    Errors.push({ message: "phone number field is empty" });
  }
  if (phNumber && !isString(phNumber)) {
    Errors.push({ message: "phNumber is not a string" });
  }
  if (Errors.length > 0) return res.status(400).json(Errors);

  return next();
}

export function validateLogin(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body;
  const Errors = [];
  if (!email) {
    Errors.push({ message: "email field is emtpy" });
  }
  if (!password) {
    Errors.push({ message: "password field is empty" });
  }
  if (email && !isString(email)) {
    Errors.push({ message: "email field is not a string" });
  }
  if (email && !validEmail(email)) {
    Errors.push({ message: "invalid email structure" });
  }
  if (password && !isString(password)) {
    Errors.push({ message: "password is not a string" });
  }
  if (Errors.length > 0) {
    return res.status(400).json(Errors);
  }
  return next();
}

export function validateForgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email } = req.body;
  const Errors = [];
  if (!email) {
    Errors.push({ message: "email field is emtpy" });
  }
  if (email && !isString(email)) {
    Errors.push({ message: "email field is not a string" });
  }
  if (email && !validEmail(email)) {
    Errors.push({ message: "invalid email structure" });
  }

  if (Errors.length > 0) {
    return res.status(400).json(Errors);
  }

  return next();
}

export function validateChangePassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { newPassword } = req.body;
  const Errors: ErrorT = [];

  if (!newPassword) {
    Errors.push({ message: "newPassword field is empty" });
  }
  if (newPassword && !isString(newPassword)) {
    Errors.push({ message: "newPassword field is not a string" });
  }

  if (Errors.length > 0) {
    return res.status(400).json(Errors);
  }
  return next();
}
