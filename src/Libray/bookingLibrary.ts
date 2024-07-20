import bookingModel, { bookingType } from "../Models/bookingModel";
import { SortOrder } from "mongoose";
export async function getBookigByCondition(
  query: object,
  projection: { [key: string]: boolean | 1 | 0 } = {},
  populate: string[] = []
) {
  try {
    const bookingDoc = await bookingModel
      .findOne(query, projection)
      .populate(populate);
    return Promise.resolve(bookingDoc);
  } catch (err) {
    return Promise.reject(err);
  }
}
type hoardingProjection = {
  [k in keyof bookingType]?: boolean | number;
};

export async function getBookingsByCondition(
  query: object,
  page = 1,
  limit = 10,
  projection: hoardingProjection = {},
  populate: { path: string; select?: string }[] = [],
  sortBy: { [key: string]: SortOrder } = {}
) {
  try {
    const bookingDocs = await bookingModel
      .find(query)
      .sort(sortBy)
      .limit(limit)
      .skip((page - 1) * limit)
      .populate(populate);
    return Promise.resolve(bookingDocs);
  } catch (err) {
    return Promise.reject(err);
  }
}

export function noOfDaysBetDates(date1: Date, date2: Date) {
  let Difference_In_Time = date2.getTime() - date1.getTime();

  return Math.round(Difference_In_Time / (1000 * 3600 * 24));
}
