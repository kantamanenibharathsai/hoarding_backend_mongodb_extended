import categoryModel from "../Models/categoryModel";
import { Request, Response } from "express";
import { uploadfiles } from "../helpers/cloudinaryUtils";

export async function addCategory(req: Request, res: Response) {
  try {
    const { name } = req.body;
    const file = req.file;
    const categoryDoc = await categoryModel.findOne({ name: name });
    if (categoryDoc)
      return res
        .status(400)
        .json({ message: "category already exists ,cannot create new one" });
    const objCreate: any = { name };
    if (file) {
      const [imageUrl] = await uploadfiles([file]);
      objCreate["image"] = imageUrl;
    }
    const category = await categoryModel.create(objCreate);
    return res.json({ data: category });
  } catch (err) {
    return res.json({ err });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const category = await categoryModel.findOne({ _id: id });
    if (!category) return res.json({ message: "category not found" });
    await category.deleteOne();
    return res.json({ message: "category deleted successfully" });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function getCategoryList(req: Request, res: Response) {
  try {
    const categories = await categoryModel.find({});
    return res.json({ data: categories });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function updateCategoryDoc(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const category = await categoryModel.findOne({ _id: id });
    if (!category)
      return res.status(400).json({ message: "category not found" });
    const { name } = req.body;
    const file = req.file;
    const objUpdate: any = {};
    if (name) objUpdate.name = name;
    if (file) {
      const [imageUrl] = await uploadfiles([file]);
      objUpdate["image"] = imageUrl;
    }
    await category.updateOne(objUpdate);
    const upadatedDoc = await categoryModel.findOne({ _id: id });
    return res.json({
      message: "updated the category successfully",
      datat: upadatedDoc,
    });
  } catch (err) {
    return res.status(500).json({ err });
  }
}
