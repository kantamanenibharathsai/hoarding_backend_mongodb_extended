import { NextFunction, Request, Response } from "express";
import { isString } from "../helpers/validateutils";
import mongoose from "mongoose";

export function validateCreateOwner(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const {
    ownerName,
    phoneNumber,
    email,
    password,
    address,
    businessName,
    businessRegNumber,
    businessType,
    gst,
    productVariant,
    countryCode,
  } = req.body;
  const Errors = [];
  if (!ownerName) {
    Errors.push({ message: "ownerName field is emtpy" });
  }
  if (!phoneNumber) {
    Errors.push({ message: "phoneNumber field is emtpy" });
  }
  if (!email) {
    Errors.push({ message: "email field is emtpy" });
  }
  if (!address) {
    Errors.push({ message: "address field is emtpy" });
  }
  if (!password) {
    Errors.push({ message: "password field is emtpy" });
  }
  if (ownerName && !isString(ownerName)) {
    Errors.push({ message: "ownerName is not a string" });
  }
  if (phoneNumber && !isString(phoneNumber)) {
    Errors.push({ message: "phoneNumber is not a string" });
  }
  if (email && !isString(email)) {
    Errors.push({ message: "email field is not a string" });
  }
  if (address && !isString(address)) {
    Errors.push({ message: "email field is not a string" });
  }
  if (password && !isString(password)) {
    Errors.push({ message: "email field is not a string" });
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
  const { oldPasswod, newPassword } = req.body;
  const Errors = [];
  if (!oldPasswod) {
    Errors.push({ message: "oldPassword field is emtpy" });
  }
  if (!newPassword) {
    Errors.push({ message: "newPassword field is emtpy" });
  }
  if (oldPasswod && !isString(oldPasswod)) {
    Errors.push({ message: "oldPassword is not a string" });
  }
  if (newPassword && !isString(newPassword)) {
    Errors.push({ message: "newPassword is not a string" });
  }
  if (Errors.length > 0) {
    return res.status(400).json(Errors);
  }
  return next();
}

export function validateGetUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;
  const objectId = mongoose.Types.ObjectId;
  const Errors = [];
  if (!id) {
    Errors.push({ message: "id field is emtpy" });
  }
  if (id && !objectId.isValid(id)) {
    Errors.push({ message: "id is not a valid objectId" });
  }
  if (Errors.length > 0) {
    return res.status(400).json(Errors);
  }
  return next();
}
