import { Request, Response, NextFunction } from "express";
import { isNumber, isString, validEmail } from "../helpers/validateutils";
import mongoose, { disconnect } from "mongoose";
import { OFFLINE } from "../helpers/constants";

export function validateCreateBooking(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const {
    hoardingId,
    startDate,
    endDate,
    bookingMode,
    customerEmail,
    customerName,
    customerId,
    customerPhoneNumber,
    features,
    advanceAmount,
    discountPercent,
  } = req.body;

  const Errors = [];
  const objectId = mongoose.Types.ObjectId;
  if (!hoardingId) {
    Errors.push({ message: "hoardingId field is empty" });
  }
  if (hoardingId && !isString(hoardingId)) {
    Errors.push({ message: "hoardingId field is not a string" });
  }
  if(hoardingId && !objectId.isValid(hoardingId)){
   Errors.push({message :"hoardingId is not a valid objectId"})
  }
  if (customerId && !isString(customerId)) {
    Errors.push({ message: "customer Id is not a string" });
  }
  if (customerId && !objectId.isValid(customerId)) {
    Errors.push({ message: "customerId is not a valid objectId" });
  }
  if (!bookingMode) {
    Errors.push({ message: "bookingMode field is empty" });
  }
  if (bookingMode && !isString(bookingMode)) {
    Errors.push({ message: "bookingMode field is not a string" });
  }
  // validate date string for
  // startdate
  // end date
  if (customerEmail && !isString(customerEmail)) {
    Errors.push({ message: "customeremail is not a valid string" });
  }
  if (customerEmail && isString(customerEmail) && !validEmail(customerEmail)) {
    Errors.push({ message: "customerEmail is not a valid email address" });
  }
  if (customerName && !isString(customerName)) {
    Errors.push({ message: "customerName is not a string" });
  }
  if (customerPhoneNumber && !isString(customerPhoneNumber)) {
    Errors.push({ message: "customerPhoneNumber is not a valid string" });
  }
  // validate features also
  if (advanceAmount && !isNumber(advanceAmount)) {
    Errors.push({ message: "advance amount is not a number" });
  }
  if (discountPercent && !isNumber(discountPercent)) {
    Errors.push({ message: "discount Percent is not number" });
  }
  if (advanceAmount && bookingMode !== OFFLINE) {
    Errors.push({
      message: `cannot pay advance amount in ${bookingMode} booking mode`,
    });
  }
  if (discountPercent && bookingMode !== OFFLINE) {
    Errors.push({ message: `cannot add discount in ${bookingMode} booking` });
  }
  if (Errors.length > 0) {
    return res.status(400).json(Errors);
  }
  return next();
}

export function validateConfirmBooking(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { bookingId } = req.body;
  const Errors = [];
  const objectId = mongoose.Types.ObjectId;
  if (!bookingId) {
    Errors.push({ message: "bookingId field is empty" });
  }
  if (bookingId && !isString(bookingId)) {
    Errors.push({ message: "bookingId is not a string" });
  }
  if (bookingId && !objectId.isValid(bookingId)) {
    Errors.push({ message: "bookingId is not a valid objectId" });
  }
  if (Errors.length > 0) {
    return res.status(400).json(Errors);
  }
  return next();
}

export function validateConfirmPayment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { razorpayOrderId, paymentId } = req.body;
  const Errors = [];

  if (!razorpayOrderId) {
    Errors.push({ message: "bookingId field is empty" });
  }
  if (razorpayOrderId && !isString(razorpayOrderId)) {
    Errors.push({ message: "bookingId is not a string" });
  }
  if (!paymentId) {
    Errors.push({ message: "paymentId field is empty" });
  }
  if (paymentId && !isString(paymentId)) {
    Errors.push({ message: "paymentId is not a string" });
  }

  if (Errors.length > 0) {
    return res.status(400).json(Errors);
  }
  return next();
}

export function validateCancelBooking(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { bookingId } = req.params;
  const Errors = [];
  const objectId = mongoose.Types.ObjectId;

  if (bookingId && !objectId.isValid(bookingId)) {
    Errors.push({ message: "bookingId is not a valid objectId" });
  }

  if (Errors.length > 0) {
    return res.status(400).json(Errors);
  }
  return next();
}

export function validateGetBooking(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { bookingId } = req.params;
  const Errors = [];
  const objectId = mongoose.Types.ObjectId;

  if (bookingId && !objectId.isValid(bookingId)) {
    Errors.push({ message: "bookingId is not a valid objectId" });
  }

  if (Errors.length > 0) {
    return res.status(400).json(Errors);
  }
  return next();
}

export function validateGetOwnerBookings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { ownerId } = req.params;
  const Errors = [];
  const objectId = mongoose.Types.ObjectId;

  if (ownerId && !objectId.isValid(ownerId)) {
    Errors.push({ message: "ownerId is not a valid objectId" });
  }

  if (Errors.length > 0) {
    return res.status(400).json(Errors);
  }
  return next();
}
