import {
  createUser,
  getUserById,
  getUserByCondition,
  userDoc,
  getUserPreferences,
} from "../Libray/userLibrary";
import bookingModel from "../Models/bookingModel";
import { Request, Response } from "express";

import { getHoardingById } from "../Libray/hoardingLibrary";

import { ADMIN, CUSTOMER, OFFLINE, OWNER } from "../helpers/constants";
import { bookingconfirmations } from "../helpers/constants";
import {
  noOfDaysBetDates,
  getBookigByCondition,
  getBookingsByCondition,
} from "../Libray/bookingLibrary";
import razorpayClient from "../Config/razorPay";
import hoardingModel from "../Models/hoardingModel";
import {
  sendNotification,
  sendNotificationType,
} from "../Libray/notificationLib";
import featureModel, { featureT } from "../Models/featureModel";

const { Razorpay } = require("razorpay");

// add features array into function
export async function createBooking(req: Request, res: Response) {
  try {
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
      discountPercent = 0,
    } = req.body;
    const hoarding = await getHoardingById(hoardingId);

    if (!hoarding) {
      return res.status(400).json({ message: "hoarding not found" });
    }

    if (hoarding.status === false)
      return res
        .status(400)
        .json({ message: "cannot book this hoarding as it is disabled" });

    let customer: userDoc | undefined = undefined;
    if (customerId !== undefined) {
      const userDoc = await getUserById(customerId);
      if (!userDoc)
        return res
          .status(400)
          .json({ message: "user not found , please check the id" });
      customer = userDoc;
    } else if (customerId === undefined && bookingMode === OFFLINE) {
      const customerDoc = await getUserByCondition({ email: customerEmail });
      if (customerDoc) customer = customerDoc;
      else
        customer = await createUser({
          fullName: customerName,
          email: customerEmail,
          role: CUSTOMER,
          phNumber: customerPhoneNumber,
        });
    }
    if (!customer) {
      return res.status(400).json({ message: "cannot create customer" });
    }

    // check if this hoarding belongs to this owner
    if (bookingMode === OFFLINE && req.user.id !== hoarding.owner) {
      return res
        .status(400)
        .json({ message: "this hoarding doesn't belong to you" });
    }

    const bookedDates = hoarding.datesBooked;
    let isBooked = false;
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    bookedDates.forEach((booking) => {
      if (!isBooked) {
        if (
          startDateObj >= booking.startDate &&
          startDateObj <= booking.endDate
        )
          isBooked = true;
        else if (
          endDateObj >= booking.startDate &&
          endDateObj <= booking.endDate
        )
          isBooked = true;
        else if (
          startDateObj < booking.startDate &&
          endDateObj > booking.endDate
        )
          isBooked = true;
      }
    });

    if (isBooked) {
      return res
        .status(400)
        .json({ message: "hoarding is already booked on specified dates" });
    }
    const noOfDays = noOfDaysBetDates(startDateObj, endDateObj);
    let featureDetails: any;
    if (features && Array.isArray(features) && features.length > 0) {
      featureDetails = featureModel.find({ _id: { $in: features } });
    }
    const featureAmount =
      Array.isArray(featureDetails) &&
      featureDetails.reduce((prev, feat: featureT) => {
        return prev + (feat.price || 0);
      }, 0);
    const objCreate: any = {
      customer: customer._id,
      hoarding: hoarding._id,
      startDate: startDateObj,
      endDate: endDateObj,
      numberOfDays: noOfDays,
      bookingDate: new Date(),
    };
    const paymentDetails: {
      [key: string | symbol]: string | number | undefined;
    } = {
      hoardingAmount: hoarding.costPerDay * noOfDays,
      convenienceFee: hoarding.additionalCharges?.convenienceFee,
      labourCharge: hoarding.additionalCharges?.labourCharges,
      electricityCharge: hoarding.additionalCharges?.electricityCharges,
      maintainenceCharge: hoarding.additionalCharges?.maintainanceCharges,
      gstAmount: (hoarding.costPerDay * 18) / 100,
    };

    let TotalAmount = Object.keys(paymentDetails).reduce((prevVal, curr) => {
      if (paymentDetails[curr]) {
        let amt = Number(paymentDetails[curr]) + prevVal;
        return amt;
      }
      return prevVal;
    }, 0);
    TotalAmount = TotalAmount + featureAmount;
    let firstPayment = TotalAmount;
    if (bookingMode === OFFLINE) {
      paymentDetails.discount = Number(
        (hoarding.costPerDay * noOfDays * (discountPercent / 100)).toFixed(2)
      );
      paymentDetails.advancePayment = Number(advanceAmount);
      TotalAmount -= paymentDetails?.discount;
      firstPayment = Number(advanceAmount);
      objCreate.bookingType = OFFLINE;
    }
    paymentDetails.totalAmount = TotalAmount;
    objCreate.amountDetails = paymentDetails;
    objCreate.amountDetails.firstPayment = firstPayment;
    objCreate.price = Number(TotalAmount.toFixed(2));

    const bookingDoc = await bookingModel.create(objCreate);
    return res.json({ message: "booking created", data: bookingDoc });
  } catch (err) {
    return res.status(500).json({ err: err });
  }
}

export async function confirmBooking(req: Request, res: Response) {
  try {
    const { bookingId } = req.body;

    const bookingDoc = await getBookigByCondition({ _id: bookingId }, {}, [
      "hoarding",
    ]);

    if (!bookingDoc) {
      return res
        .status(400)
        .json({ message: "booking document is not found, check booking id" });
    }

    if (bookingDoc.orderId !== null && bookingDoc.orderId !== undefined) {
      const order = await razorpayClient.orders.fetch(bookingDoc.orderId);
      if (bookingDoc.paymentDetails.paymentId) {
        const paymentDetails = await razorpayClient.payments.fetch(
          bookingDoc.paymentDetails.paymentId
        );
        if (
          paymentDetails.status === "captured" ||
          paymentDetails.status === "refunded"
        ) {
          return res.status(200).json({ message: "payment has already done" });
        }
      }
      return res.status(200).json({
        message: "orderId already exist",
        orderDetails: order,
        bookingDetails: bookingDoc,
      });
    }

    const options = {
      amount: bookingDoc?.amountDetails.firstPayment * 100,
      currency: "INR",
    };

    const order = await razorpayClient.orders.create(options);
    await bookingModel.updateOne(
      { _id: bookingDoc._id },
      { orderId: order.id }
    );
    return res.json({ orderDetails: order, bookingDetails: bookingDoc });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

// add the data to paid amount
export async function confirmPayment(req: Request, res: Response) {
  try {
    const { razorpayOrderId, paymentId } = req.body;
    const paymentDetails = await razorpayClient.payments.fetch(paymentId);
    const bookingDoc = await bookingModel.findOne({ orderId: razorpayOrderId });
    if (!bookingDoc || !paymentDetails)
      return res.status(400).json({ message: "booking is not found" });
    const remainingAmount =
      bookingDoc?.price - Number(paymentDetails.amount) / 100;

    const prmArr = [
      hoardingModel.updateOne(
        { _id: bookingDoc?.hoarding },
        {
          $push: {
            datesBooked: {
              bookingId: bookingDoc?._id,
              startDate: bookingDoc?.startDate,
              endDate: bookingDoc?.endDate,
            },
            bookings: bookingDoc._id,
          },
        }
      ),
      bookingDoc?.updateOne({
        bookingStatus: "PRINTING",
        paymentStatus: paymentDetails.status,

        $set: {
          "amountDetails.remainingAmount": remainingAmount,
        },
        paymentDetails: {
          paymentType: paymentDetails.method,
          paymentDate: new Date(paymentDetails.created_at),
          paymentId: paymentDetails.id,
        },
      }),
    ];
    await Promise.all(prmArr);
    // notify user
    const [customer, customerPref, ownerPref] = await Promise.all([
      getUserById(bookingDoc.customer, { fullName: 1 }),
      getUserPreferences(bookingDoc.customer),
      getUserPreferences(bookingDoc.owner),
    ]);

    if (customerPref?.notifications.get(bookingconfirmations)) {
      try {
        let userNotificationData: sendNotificationType = {
          userId: bookingDoc.customer,
          text: `your booking order is confirmed with booking id ${paymentDetails.id}`,
          title: "booking confirmation",
        };
        sendNotification(userNotificationData);
      } catch (err) {
        const error = new Error(JSON.stringify(err));
        console.error(error.stack);
      }
    }

    // notify owener ;
    if (ownerPref?.notifications.get(bookingconfirmations)) {
      try {
        let ownerNotificationData: sendNotificationType = {
          userId: bookingDoc.owner,
          text: `your hoarding has been successfully booked by ${customer?.fullName} with bookingId ${bookingDoc._id}`,
          title: `booking confirmation`,
        };
        sendNotification(ownerNotificationData);
      } catch (err) {
        const error = new Error(JSON.stringify(err));
        console.error(error.stack);
      }
    }

    return res.json({ message: "payment has done" });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function paymentFailed(req: Request, res: Response) {
  try {
    const { paymentId, razorpayOrderId } = req.body;
    const paymentDetails = await razorpayClient.payments.fetch(paymentId);
    await bookingModel.updateOne(
      { orderId: razorpayOrderId },
      {
        paymentStatus: paymentDetails.status,
        paymentDetails: {
          paymentType: paymentDetails.method,
          paymentDate: new Date(paymentDetails.created_at),
          paymentId: paymentDetails.id,
        },
      }
    );
    return res.json({ message: "payment failed" });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function cancelBooking(req: Request, res: Response) {
  try {
    const user = req.user;
    const { bookingId } = req.params;
    const bookingDoc = await getBookigByCondition({ _id: bookingId });
    // if paid initiate refund
    //
    await bookingDoc?.updateOne({ bookingStatus: "CANCELLED" });
    return res.json({ message: "cancelled the booking order" });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function getAllBookings(req: Request, res: Response) {
  try {
    const user = req.user;
    let { page, limit, status, date, minPrice, maxPrice } = req.query;
    const payload = req.query;
    if (!page) page = "1";
    if (!limit) limit = "10";

    const objQuery: any = {};
    const filters = ["status", "date", "minPrice", "maxPrice"];
    if (status) {
      objQuery["hoardingStatus"] = status;
    }
    if (date) {
      let minDate = new Date(date.toString());
      let maxDate = new Date(new Date().setDate(minDate.getDate() + 1));
      objQuery["$and"] = [];
      objQuery["$and"].push(
        { createdAt: { $gte: minDate } },
        {
          createdAt: {
            $lte: maxDate,
          },
        }
      );
    }
    if (minPrice && maxPrice) {
      if (!objQuery["$and"]) objQuery["$and"] = [];

      objQuery["$and"].push(
        { price: { $gte: minPrice } },
        { price: { $lte: maxPrice } }
      );
    }
    if (user.role === OWNER) {
      objQuery["owner"] = user.id;
    } else if (user.role === CUSTOMER) objQuery["customer"] = user.id;

    const bookings = await getBookingsByCondition(
      objQuery,
      Number(page),
      Number(limit),
      {},
      [{ path: "customer" }, { path: "hoarding" }]
    );

    return res.json({ data: bookings });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function getBooking(req: Request, res: Response) {
  try {
    const { bookingId } = req.params;
    const bookingDoc = await getBookigByCondition({ _id: bookingId });
    if (!bookingDoc) {
      return res
        .status(400)
        .json({ message: "booking not found with specific bookingId" });
    }
    return res.json({ data: bookingDoc });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function getOwnerBookings(req: Request, res: Response) {
  try {
    const { ownerId } = req.params;
    const { page, limit } = req.query;
    const bookings = await getBookingsByCondition(
      { ownerId },
      Number(page),
      Number(limit)
    );
    if (bookings.length === 0) {
      return res.status(400).json({ message: "no booking found" });
    }
    return res.json({ data: bookings });
  } catch (err) {
    return res.status(500).json({ err });
  }
}
