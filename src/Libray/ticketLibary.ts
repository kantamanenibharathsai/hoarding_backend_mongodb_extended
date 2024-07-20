import ticketModel from "../Models/ticketModel";
import { SortOrder } from "mongoose";
export async function getTicketsByCondition(
  query: object,
  page = 1,
  limit = 20,
  sort: { [key: string]: SortOrder } = { createdAt: 1 }
) {
  try {
    const tickets = await ticketModel
      .find(query)
      .populate("user.id")
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);
    return Promise.resolve(tickets);
  } catch (err) {
    return Promise.reject(err);
  }
}
