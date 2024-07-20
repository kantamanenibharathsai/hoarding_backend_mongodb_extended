import { Router } from "express";
import {
  createBooking,
  confirmBooking,
  confirmPayment,
  cancelBooking,
  getAllBookings,
  getBooking,
  getOwnerBookings,
} from "../Controllers/bookingControllers";

import {
  validateCreateBooking,
  validateCancelBooking,
  validateConfirmBooking,
  validateGetBooking,
  validateGetOwnerBookings,
  validateConfirmPayment,
} from "../Validators/bookingValidator";
const router = Router();

router.post("/", validateCreateBooking, createBooking);
router.post("/pending", validateConfirmBooking, confirmBooking);

router.post("/payment", validateConfirmPayment, confirmPayment);
router.get("/cancel/:bookingId", validateCancelBooking, cancelBooking);

router.get("/getAllBookings", getAllBookings);
router.get("/:bookingId", validateGetBooking, getBooking);
router.get(
  "/getOwnerBookings/:ownerId",
  validateGetOwnerBookings,
  getOwnerBookings
);
export default router;
