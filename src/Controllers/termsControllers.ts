import { Request, Response } from "express";
import termsModel from "../Models/termsModel";
import { uploadfiles } from "../helpers/cloudinaryUtils";
import mongoose from "mongoose";
import { isArray } from "../helpers/validateutils";

export async function addTermsAndcondition(req: Request, res: Response) {
  try {
    const { role, termsAndConditons } = req.body;
    const file = req.files;

    const objCreate = {
      role,
      termsAndConditon: termsAndConditons,
    };
    const terms = await termsModel.create(objCreate);
    return res.json({ data: terms });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function getTerms(req: Request, res: Response) {
  try {
    const user = req.user;
    const terms = await termsModel.findOne({ role: user.role });
    if (!terms) {
      return res.status(400).json({
        message: "terms and conditions are not provided to the specific role",
      });
    }
    return res.json({ data: terms });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function deleteTermsAndConditon(req: Request, res: Response) {
  try {
    const { termsId } = req.params;
    await termsModel.deleteOne({ _id: termsId });
    return res.json({ message: "terms and condtion document deleted" });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function updateTermsAndCondtion(req: Request, res: Response) {
  try {
    const { role, termsId } = req.body;

    let objupdate: any = {};
    if (role) objupdate["role"] = role;

    await termsModel.updateOne({ _id: termsId }, objupdate);
    return res.json({ message: "updated" });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function getTermsByRole(req: Request, res: Response) {
  try {
    const { role } = req.query;
    const terms = await termsModel.findOne({ role });
    return res.json({ data: terms });
  } catch (err) {
    return res.status(500).json({ err });
  }
}
