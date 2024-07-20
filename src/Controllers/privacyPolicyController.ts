import { uploadfiles } from "../helpers/cloudinaryUtils";
import privacyPolicyModel, {
  privacyPolicyT,
} from "../Models/privacyPolicyModel";
import { Request, Response } from "express";

export async function createPrivacyPolicy(req: Request, res: Response) {
  try {
    const { role } = req.body;
    const file = req.file;
    const objCreate: Partial<privacyPolicyT> = {
      role,
    };
    if (file) {
      const [fileUrl] = await uploadfiles([file]);
      objCreate["privacyPolicy"] = fileUrl;
    }
    const privacyPolicy = await privacyPolicyModel.create(objCreate);
    return res.json({ data: privacyPolicy });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function updatePrivacyPolicy(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const objUpdate: Partial<privacyPolicyT> = {};
    if (role) {
      objUpdate.role = role;
    }
    if (req.file) {
      const [fileUrl] = await uploadfiles([req.file]);
      objUpdate.privacyPolicy = fileUrl;
    }

    const privacyPolicy = await privacyPolicyModel.findOne({ _id: id });
    if (!privacyPolicy)
      return res.status(400).json({ message: "the document is not found" });
    await privacyPolicy.updateOne({ _id: id }, objUpdate);
    const privacyPolicyDoc = await privacyPolicyModel.findOne({ _id: id });
    return res.json({
      message: "updated privacy policy",
      data: privacyPolicyDoc,
    });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function deletePrivacyPolicy(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const privacyPolicy = await privacyPolicyModel.findOne({ _id: id });
    if (!privacyPolicy)
      return res.status(400).json({ message: "privacy policy not found" });
    await privacyPolicyModel.deleteOne({ _id: id });
    return res.json({ message: "deleted privacy policy" });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function getPrivacyPolicy(req: Request, res: Response) {
  try {
    const user = req.user;
    const privacyPolicy = await privacyPolicyModel.findOne({ role: user.role });
    if (!privacyPolicy)
      return res.status(400).json({ message: "privacy policy not found" });
    return res.json({ data: privacyPolicy });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function getPrivacyPolicyByRole(req: Request, res: Response) {
  try {
    const user = req.user;
    const { role } = req.params;
    const privacyPolicy = await privacyPolicyModel.findOne({ role: role });
    return res.json({ data: privacyPolicy });
  } catch (err) {
    return res.status(500).json({ err });
  }
}
