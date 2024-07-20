import { Express, Request, Response } from "express";
import countryModel from "../Models/countryCodeModel";

export async function addCountryCode(req: Request, res: Response) {
  try {
    const { name, code } = req.body;
    const countryCode = await countryModel.findOne({ countryName: name });
    if (countryCode)
      return res.json({ message: "country already exist in the db" });
    const countryCodeDoc = await countryModel.create({
      countryName: name,
      countryCode: code,
    });
    return res.json({ data: countryCodeDoc });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function deleteCountryCode(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const countryCode = await countryModel.findOne({ _id: id });
    if (!countryCode) return res.json({ message: "country not found" });
    await countryCode.deleteOne();
    return res.json({ message: "country deleted successfully" });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function getCountryList(req: Request, res: Response) {
  try {
    const countryCodeList = await countryModel.find({});
    return res.json({ data: countryCodeList });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function updateContryCode(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const countryCode = await countryModel.findOne({ _id: id });
    if (!countryCode)
      return res.status(400).json({ message: "country code not found" });
    const { name, code } = req.body;
    const objUpdate: any = {};
    if (name) objUpdate.name = name;
    if (code) objUpdate.code = code;
    await countryCode.updateOne(objUpdate);
    const upadatedDoc = await countryModel.findOne({ _id: id });
    return res.json({
      message: "updated the contry code successfully",
      datat: upadatedDoc,
    });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function getCountryByQuery(req: Request, res: Response) {
  try {
    const query: any = {};
    const { name, code } = req.query;
    if (name) {
      query["$or"] = [];
      query["$or"].push({ countryName: { $regex: name } });
    }
    if (code) {
      if (query["$or"]) {
        query["$or"].push({ countryCode: { $regex: code } });
      } else {
        query["$or"] = [];
        query["$or"].push({ countryCode: { $regex: code } });
      }
    }

    const docs = await countryModel.find(query);
    return res.json({ data: docs });
  } catch (err) {
    return res.status(500).json({ err });
  }
}
