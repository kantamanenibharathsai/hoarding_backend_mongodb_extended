import { NextFunction, Request, Response } from "express";
import { isString, isNumber } from "../helpers/validateutils";
import mongoose from "mongoose";

export async function validateCreatePlan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const Errors = [];
  const { planName, duration, pricePerMonth, hoardingLimit } = req.body;
  if (!planName) {
    Errors.push({ message: "planName field is empty" });
  }
  if (!duration) {
    Errors.push({ message: "duration field is empty" });
  }
  if (!pricePerMonth) {
    Errors.push({ message: "pricePerMonth field is empty" });
  }
  if (!hoardingLimit) {
    Errors.push({ message: "hoardingLimit field is empty" });
  }
  if (planName && !isString(planName)) {
    Errors.push({ message: "planName is not a string" });
  }
  if (duration && !isString(duration)) {
    Errors.push({ message: "duration is not a string" });
  }
  if (pricePerMonth && !isNumber(pricePerMonth)) {
    Errors.push({ message: "pricePerMonth is not a number" });
  }
  if (hoardingLimit && !isNumber(hoardingLimit)) {
    Errors.push({ message: "hoardingLimit is not a number" });
  }
  if (Errors.length > 0) {
    return res.status(400).json(Errors);
  }
  return next();
}

export function validateDeletePlan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const Errors = [];
  const objectId = mongoose.Types.ObjectId;
  const { planId } = req.params;

  if (planId && !objectId.isValid(planId)) {
    Errors.push({ message: "planId is not a valid object Id" });
  }
  if (Errors.length > 0) {
    return res.status(400).json(Errors);
  }
  return next();
}

export function validateUpdatePlan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const Errors = [];
  const objectId = mongoose.Types.ObjectId;
  const { planId } = req.params;

  if (planId && !objectId.isValid(planId)) {
    Errors.push({ message: "planId is not a valid object Id" });
  }
  if (Errors.length > 0) {
    return res.status(400).json(Errors);
  }
  return next();
}

export function validateTogglePlanStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const Errors = [];
  const objectId = mongoose.Types.ObjectId;
  const { planId } = req.params;
  const { status } = req.body;
  if (!planId) {
    Errors.push({ message: "planName field is empty" });
  }
  if (planId && !objectId.isValid(planId)) {
    Errors.push({ message: "planId is not a valid object Id" });
  }
  if (typeof status === undefined) {
    Errors.push({ message: "status field is emtpy" });
  }
  if (typeof status !== undefined && typeof status !== "boolean") {
    Errors.push({ message: "status field is not a boolean value" });
  }
  if (Errors.length > 0) {
    return res.status(400).json(Errors);
  }
  return next();
}
