import featureModel from "../Models/featureModel";
import { Request, Response } from "express";

export async function addFeature(req: Request, res: Response) {
  try {
    const { name, price } = req.body;
    const feature = await featureModel.findOne({ name: name });
    if (feature)
      return res.status(200).json({ message: "feature already exists" });
    const featureDoc = await featureModel.create({ name, price });
    return res.json({ message: "feature created", data: featureDoc });
  } catch (err) {
    res.status(500).json({ err });
  }
}

export async function getFeatureById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const feature = await featureModel.findOne({ _id: id });
    if (!feature) return res.status(400).json({ message: "feature not found" });
    return res.json({ data: feature });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function getAllFeatures(req: Request, res: Response) {
  try {
    const features = await featureModel.find({});
    return res.json({ data: features });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function deleteFeature(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const feature = await featureModel.findOne({ _id: id });
    if (!feature) return res.status(400).json({ message: "feature not found" });
    await feature.deleteOne({});
    return res.json({ message: "deleted feature successfully" });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function updateFeature(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, price } = req.body;
    const feature = await featureModel.findOne({ _id: id });
    if (!feature) return res.status(400).json({ message: "feature not found" });
    const objUpdate: any = {};
    if (name) objUpdate.name = name;
    if (price) objUpdate.price = price;
    const updatedFeature = await featureModel.findOne({ _id: id });
    return res.json({ message: "updated feature", data: updatedFeature });
  } catch (err) {
    return res.status(500).json({ err });
  }
}
