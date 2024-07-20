import { Request, Response } from "express";
import helpModel from "../Models/helpModel";

export async function createHelp(req: Request, res: Response) {
  try {
    const { query } = req.body;
    const user = req.user;
    const helpDoc = await helpModel.create({ query, raisedBy: user.id });
    return res.json({ message: "query added", data: helpDoc });
  } catch (err) {
    return Promise.reject({ err });
  }
}

export async function deletehelpDoc(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const helpDoc = await helpModel.findOne({ _id: id });
    if (!helpDoc) return res.status(400).json({ message: "query not found" });
    await helpDoc.deleteOne();
    return res.json({ message: "help document delted successfully" });
  } catch (err) {
    return Promise.reject({ err });
  }
}

export async function getAllQueries(req: Request, res: Response) {
  try {
    const helpDocs = await helpModel.find({ answered: false });

    return res.json({ data: helpDocs });
  } catch (err) {
    return Promise.reject({ err });
  }
}

export async function answerQuery(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { answer } = req.body;
    const user = req.user;
    const helpDoc = await helpModel.findOne({ _id: id });
    if (!helpDoc) return res.status(400).json({ err: "helpDoc not found" });
    await helpDoc.updateOne({ answered: true, answeredBy: user.id, answer });
    const updatedDoc = await helpModel.findOne({ _id: id });
    return res.json({ message: "added answer to the query", data: helpDoc });
  } catch (err) {
    return res.status(500).json({ err });
  }
}
export async function getHelpById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const helpDoc = await helpModel.findOne({ _id: id });
    if (!helpDoc) return res.status(400).json({ err: "helpDoc not found" });
    await helpDoc.deleteOne();
    return res.json({ message: "deleted the query successfully" });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function updateQuery(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { query, answer } = req.body;
    const objUpdate: any = {};
    if (query) objUpdate["query"] = query;
    if (answer) objUpdate["answer"] = answer;

    const helpDoc = await helpModel.findOne({ _id: id });
    if (!helpDoc) return res.status(400).json({ err: "helpDoc not found" });
    await helpDoc.updateOne(objUpdate);
    return res.json({ message: "updated the query successfully" });
  } catch (err) {
    return res.status(500).json({ err });
  }
}
