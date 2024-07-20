import { Request, Response } from "express";
import languageModel, { languageType } from "../Models/languageModel";

export async function addLanguage(req: Request, res: Response) {
  try {
    const { name } = req.body;
    const user = req.user;
    const languageDoc = await languageModel.findOne({ name: name });
    if (languageDoc) {
      return res.status(200).json({ message: "language already exists" });
    }
    const language = await languageModel.create({ name, createdBy: user.id });
    return res.status(200).json({ message: "language added", data: language });
  } catch (err) {
    return res.status(500).json(err);
  }
}

export async function getAllLanguages(req: Request, res: Response) {
  try {
    const languages = await languageModel.find({}, { name: 1 });
    return res.json({ data: languages });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function updateLanguage(req: Request, res: Response) {
  try {
    const { name } = req.body;
    const { languageId } = req.params;
    const objupdate: Partial<languageType> = { name: name };
    await languageModel.updateOne({ _id: languageId }, objupdate);
    const updatedLanguage = await languageModel.findOne({ _id: languageId });
    return res.json({
      message: "updated language successfully",
      data: updateLanguage,
    });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function deleteLanguage(req: Request, res: Response) {
  try {
    const { languageId } = req.params;

    await languageModel.deleteOne({ _id: languageId });

    return res.json({
      message: "deleted language successfully",
    });
  } catch (err) {
    return res.status(500).json({ err });
  }
}
