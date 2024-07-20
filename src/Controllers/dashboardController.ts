import { Express, Request, Response } from "express";
import { getBookingsByCondition } from "../Libray/bookingLibrary";
import { getHoardingsByCondition } from "../Libray/hoardingLibrary";
import bookingModel, { bookingType } from "../Models/bookingModel";
import { WEEK, MONTH, YEAR } from "../helpers/constants";
import {
  getWeeklyChartOrder,
  monthlyCharOrder,
  yearlyChartOrder,
} from "../Libray/dashboardLibrary";

//get total number of bookings
//get total number of customers
// get recent 5 bookings
export async function recentBookings(req: Request, res: Response) {
  try {
    const user = req.user;
    const payload = req.query;
    const limit = payload.limit === undefined ? 5 : Number(payload.limit);
    const page = payload.page === undefined ? 1 : Number(payload.page);
    const customerProjection = "fullName email phNumber profileUrl";
    const hoardingProjection = "name";

    const bookingsPrm = getBookingsByCondition(
      {},
      page,
      limit,
      {},
      [
        { path: "customer", select: customerProjection },
        { path: "hoarding", select: hoardingProjection },
      ],
      { createdAt: "desc" }
    );
    const customersPrm = bookingModel.aggregate([
      { $group: { _id: "$customer", createdDate: { $push: "$createdAt" } } },
      {
        $unwind: {
          path: "$createdDate",
        },
      },
      {
        $sort: {
          createdDate: 1,
        },
      },
    ]);
    const currDate = new Date();
    const prevDate = new Date(
      currDate.getFullYear(),
      currDate.getMonth() - 1,
      1
    );

    const prevBookingsPrm = bookingModel
      .find({}, { createdAt: 1 })
      .sort({ createdAt: 1 });

    const [bookings, customerDocs, allBookings] = await Promise.all([
      bookingsPrm,

      customersPrm,
      prevBookingsPrm,
    ]);
    const customerSet = new Set();
    const unqCustomers: any[] = [];
    customerDocs.forEach((element: any) => {
      if (!customerSet.has(element._id)) {
        customerSet.add(element._id);
        unqCustomers.push(element);
      }
    });
    const totalCustomers = unqCustomers.length;
    const prevMonthCust = unqCustomers.filter((ele) => {
      return (
        ele.createdDate <
        new Date(currDate.getFullYear(), currDate.getMonth(), 1)
      );
    });
    const prevMonthCustomerCnt = prevMonthCust.length;
    const customerCntDifference = totalCustomers - 2 * prevMonthCustomerCnt;
    const customerDiffPerc =
      prevMonthCustomerCnt !== 0
        ? (customerCntDifference / prevMonthCustomerCnt) * 100
        : customerCntDifference === 0
        ? 0
        : 100;

    const totalBookings = allBookings.length;
    const prevMonthBookings = allBookings.filter((ele) => {
      return (
        ele.createdAt >= prevDate &&
        ele.createdAt < new Date(currDate.getFullYear(), currDate.getMonth(), 1)
      );
    });
    const prevMonthBookingCnt = prevMonthBookings.length;
    const bookingDiff =
      totalBookings - prevMonthBookings.length - prevMonthBookings.length;
    const bookingDiffPerc =
      prevMonthBookingCnt !== 0
        ? (bookingDiff / prevMonthBookingCnt) * 100
        : bookingDiff === 0
        ? 0
        : 100;

    return res.json({
      data: {
        recentBookings: bookings,
        totalCustomers,
        customerPercentage: customerDiffPerc,
        totalBookings,
        bookingPercentage: bookingDiffPerc,
      },
    });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function hoardingDetails(req: Request, res: Response) {
  try {
    const user = req.user;
    const ownerHordings = await getHoardingsByCondition({ owner: user.id });
    const bookedCount = ownerHordings.reduce((prev, curr) => {
      return curr.datesBooked.length > 0 ? prev + 1 : prev;
    }, 0);
    const hoardingCount = ownerHordings.length;
    const bookedPercentage = ((bookedCount / hoardingCount) * 100).toFixed(2);
    const response = {
      totalHoardingCount: hoardingCount,
      bookedPercentage,
      bookedCount,
    };
    return res.json({ data: response });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function chartOrder(req: Request, res: Response) {
  try {
    const range = req.query.range ? req.query.range : WEEK;
    const user = req.user;
    switch (range) {
      case WEEK:
        try {
          const weeklyData = await getWeeklyChartOrder(user);
          return res.json({ data: weeklyData });
        } catch (err) {
          throw err;
        }

      case MONTH:
        try {
          const data = await monthlyCharOrder(user);
          return res.json({ data: data });
        } catch (err) {
          throw err;
        }

      case YEAR:
        try {
          const data = await yearlyChartOrder(user);
          return res.json({ data: data });
        } catch (err) {
          throw err;
        }
    }
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function getRevenue(req: Request, res: Response) {
  try {
  } catch (err) {}
}
