import { NextFunction, Request, Response } from "express";
import {
  isString,
  isNumber,
  isAlphaNum,
  isArray,
} from "../helpers/validateutils";
import mongoose from "mongoose";

export function validateGetHoarding(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const objectId = mongoose.Types.ObjectId;
  const { id } = req.params;
  const Errors = [];
  if (!id) {
    Errors.push({ message: "id is undefined" });
  }
  if (id && typeof id === "string" && !objectId.isValid(id)) {
    Errors.push({ message: "objectId is not a valid document object id" });
  }
  if (Errors.length > 0) {
    return res.status(400).json(Errors);
  }
  return next();
}

export function validateAddHoarding(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const Errors = [];
  const {
    name,
    address,
    category,
    height,
    width,
    price,
    features,

    hoardingOwner,
    latitude,
    longitude,
  } = req.body;
  const objectId = mongoose.Types.ObjectId;
  if (!name) {
    Errors.push({ message: "name field is empty" });
  }
  if (!width) {
    Errors.push({ message: "width field is empty" });
  }
  if (!height) {
    Errors.push({ message: "height field is empty" });
  }
  if (!address) {
    Errors.push({ message: "address field is empty" });
  }
  if (!price) {
    Errors.push({ message: "price field is empty" });
  }
  if (!category) {
    Errors.push({ message: "category field is empty" });
  }
  if (name && !isString(name)) {
    Errors.push({ message: "name is not a string" });
  }
  if (width && !isAlphaNum(width)) {
    Errors.push({ message: "width is not a number" });
  }
  if (height && !isAlphaNum(width)) {
    Errors.push({ message: "height is not a number" });
  }
  if (price && !isAlphaNum(price)) {
    Errors.push({ message: "price is not a number" });
  }
  if (hoardingOwner && !objectId.isValid(hoardingOwner)) {
    Errors.push({ message: "hoardingOwner is not a string" });
  }
  if (features && !isArray(features)) {
    Errors.push({ message: "features is not a array" });
  }
  if (latitude && !isAlphaNum(latitude)) {
    Errors.push({ message: "latitude is not a number" });
  }
  if (longitude && !isAlphaNum(longitude)) {
    Errors.push({ message: "longitude is not a valid number" });
  }
  if (Errors.length > 0) {
    return res.status(400).json(Errors);
  }
  return next();
}

export function validateremoveHoarding(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const Errors = [];
  const objectId = mongoose.Types.ObjectId;
  const { id } = req.params;
  if (id && !objectId.isValid(id)) {
    Errors.push({ message: "id is not a valid ObjectId" });
  }
  if (Errors.length > 0) {
    return res.status(400).json(Errors);
  }
  return next();
}

export function validategetHoardingsByOwner(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const Errors = [];
  const objectId = mongoose.Types.ObjectId;
  const { ownerId } = req.params;

  if (ownerId && !objectId.isValid(ownerId)) {
    Errors.push({ message: "objectId is not a valid id" });
  }
  if (Errors.length > 0) {
    return res.status(400).json(Errors);
  }
  return next();
}

export function validateDisableHoarding(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const Errors = [];
  const objectId = mongoose.Types.ObjectId;
  const { hoardingId } = req.params;

  if (hoardingId && !objectId.isValid(hoardingId)) {
    Errors.push({ message: "hoardingId is not a valid objectId" });
  }
  if (Errors.length > 0) {
    return res.status(400).json(Errors);
  }
  return next();
}
