import fundAccount from "razorpay/dist/types/fundAccount";
import bookingModel from "../Models/bookingModel";
import { User } from "../types/customTypes";
import mongoose from "mongoose";
export async function getWeeklyChartOrder(user: User) {
  try {
    const sevendays = new Date();
    sevendays.setDate(sevendays.getDate() - 2);
    const cmpFormat = "%Y-%m-%d";
    const data = await aggregateChartOrder(
      user.id,
      sevendays,
      new Date(),
      cmpFormat
    );

    return Promise.resolve(data);
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function monthlyCharOrder(user: User) {
  try {
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() - 30);
    const cmpFormat = "%Y-%m-%d";
    const data = aggregateChartOrder(
      user.id,
      thirtyDays,
      new Date(),
      cmpFormat
    );

    return Promise.resolve(data);
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function yearlyChartOrder(user: User) {
  try {
    const firstMonth = new Date();
    firstMonth.setDate(1);
    const cmpFormat = "%Y-%m";
    const data = aggregateChartOrder(
      user.id,
      firstMonth,
      new Date(),
      cmpFormat
    );

    return Promise.resolve(data);
  } catch (err) {
    return Promise.reject(err);
  }
}

async function aggregateChartOrder(
  id: string,
  minDate: Date,
  maxDate: Date,
  format: string
) {
  try {
    const data = await bookingModel.aggregate([
      {
        $match: {
          owner: id,
          $and: [
            { "$paymentDetails.paymentDate": { $gte: minDate } },
            { "$paymentDetails.paymentDate": { $lte: maxDate } },
          ],
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format,
              date: "$paymentDetails.paymentDate",
            },
          },
          amount: { $sum: "$amountDetails.paidAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return Promise.resolve(data);
  } catch (err) {
    return Promise.reject(err);
  }
}
