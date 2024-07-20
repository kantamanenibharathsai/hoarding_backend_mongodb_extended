import { NextFunction, Request, Response } from "express";
import { isString } from "../helpers/validateutils";
import { ErrorT } from "../types/customTypes";
import mongoose from "mongoose";
const objectId = mongoose.Types.ObjectId;

export function validateVerifyOtp(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId, otp, verificationType } = req.body;
  const Errors: ErrorT = [];
  if (!userId) {
    Errors.push({ message: "userId field is empty" });
  }
  if (userId && !isString(userId)) {
    Errors.push({ message: "userId is not a string" });
  }
  if (userId && !objectId.isValid(userId)) {
    Errors.push({ message: "userId is not a type of objectId" });
  }
  if (!otp) {
    Errors.push({ message: "otp field is empty" });
  }
  if (otp && !isString(otp)) {
    Errors.push({ message: "otp is not a string" });
  }
  if (!verificationType) {
    Errors.push({ message: "verificationType field is empty" });
  }
  if (verificationType && !isString(verificationType)) {
    Errors.push({ message: "verificationType is not a string" });
  }
  if (Errors.length > 0) {
    return res.status(400).json(Errors);
  }
  return next();
}
