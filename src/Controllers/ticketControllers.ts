import { Request, Response } from "express";
import ticketModel, { ticketType } from "../Models/ticketModel";
import { getUserById } from "../Libray/userLibrary";
import { CANCELLED, CUSTOMER, PENDING } from "../helpers/constants";
import { getTicketsByCondition } from "../Libray/ticketLibary";
import mongoose, { SortOrder } from "mongoose";
export async function addTicket(req: Request, res: Response) {
  try {
    const { subject, query, bookingId } = req.body;
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }
    const objCreate: ticketType = {
      user: {
        name: user?.fullName,
        email: user?.email,
        id: user?.id,
      },
      query,
      subject,
      date: new Date(),
      bookingId,
      status: PENDING,
    };
    const ticket = await ticketModel.create(objCreate);
    return res.json({ message: "ticket created", data: ticket });
  } catch (err) {
    res.status(500).json(err);
  }
}

export async function removeTicket(req: Request, res: Response) {
  try {
    const { ticketId } = req.params;
    const ticket = await ticketModel.findOne({ _id: ticketId });
    if (!ticket) {
      return res.status(400).json({ message: "ticket not found" });
    }
    await ticketModel.deleteOne({ _id: ticketId });
    return res.json({ message: "ticket created", data: ticket });
  } catch (err) {
    res.status(500).json(err);
  }
}

export async function getTickets(req: Request, res: Response) {
  try {
    const { limit, page, soryBy } = req.query;
    const payload = req.query;
    console.log(payload);
    const planFields = ["status", "ticketId", "customerName"];
    let query: { [key: string]: string | object } = {};
    planFields.forEach((planKey) => {
      if (payload[planKey] !== undefined) {
        if (planKey === "ticketId") {
          return (query["_id"] = payload[planKey] as string);
        }
        if (planKey === "customerName") {
          return (query["user.name"] = { $regex: payload["customerName"] });
        }
        query[planKey] = payload[planKey] as string;
      }
    });

    let SortOrder: { [key: string]: SortOrder } = {};
    if (soryBy) {
      SortOrder[soryBy.toString()] = 1;
    }
    const tickets = await getTicketsByCondition(
      query,
      Number(page),
      Number(limit),
      SortOrder
    );
    return res.json(tickets);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
}

export async function updateTicket(req: Request, res: Response) {
  try {
    const { ticketId } = req.params;
    const payload = req.body;
    const user = req.user;
    const planFields = ["subject", "query", "status", "solution"];
    if (payload.solution !== undefined && user.role === CUSTOMER)
      return res.json({
        message: "you do not have permission to add answer to a ticket",
      });
    let objUpdate: { [key: string]: string | object } = {};
    planFields.forEach((planKey) => {
      if (payload[planKey] !== undefined) {
        objUpdate[planKey] = payload[planKey] as string;
      }
    });
    objUpdate["answeredBy.id"] = req.user.id;
    objUpdate["answeredDate"] = new Date();
    await ticketModel.updateOne({ _id: ticketId }, { $set: objUpdate });

    return res.json({ message: "updated ticket successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
}
