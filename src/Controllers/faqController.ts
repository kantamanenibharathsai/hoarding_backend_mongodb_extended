import { Express, Request, Response } from "express";
import faqModel from "../Models/faqModel";

export async function addFaqQuery(req: Request, res: Response) {
  try {
    const { question, answer } = req.body;
    const user = req.user;
    const objCreate = { question, answer, addedBy: user.id };
    const faq = await faqModel.create(objCreate);
    return res.json({ message: "faq is created", data: faq });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function deleteFaq(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const faq = await faqModel.findOne({ _id: id });
    if (!faq) return res.status(400).json({ err: "faq document not found" });
    await faq.deleteOne();
    return res.json({ message: "deleted faq successfully" });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function getFaqQuery(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const faq = await faqModel.findOne({ _id: id });
    if (!faq) return res.status(400).json({ err: "faq document not found" });

    return res.json({ data: faq });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function getAllFaqs(req: Request, res: Response) {
  try {
    const page = req.body.page || 1;
    const limit = req.body.limit || 10;

    const faqDocs = await faqModel.find({});
    return res.json({ data: faqDocs });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function updateFaq(req: Request, res: Response) {
  try {
    const { question, answer } = req.body;
    const { id } = req.params;
    const objUpdate: any = {};
    if (question) objUpdate["question"] = question;
    if (answer) objUpdate["answer"] = answer;
    const faq = await faqModel.findOne({ _id: id });
    if (!faq) return res.status(400).json({ err: "faq document not found" });
    await faq.updateOne(objUpdate);
    return res.json({ message: "updated faq query successfully" });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function searchFaqs(req: Request, res: Response) {
  try {
    const { searchFaqs } = req.query;
    const docs = await faqModel.find({
      question: { $regex: searchFaqs, $options: "$i" },
    });
    return res.json({ data: docs });
  } catch (err) {
    return res.status(500).json({ err });
  }
}
