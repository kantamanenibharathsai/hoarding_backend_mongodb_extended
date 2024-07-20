import { Request, Response } from "express";
import userModel from "../Models/userModel";
import {
  getUserById,
  getUsersByCondition,
  createUser,
  updateUser,
} from "../Libray/userLibrary";
import { uploadfiles } from "../helpers/cloudinaryUtils";
import { userType } from "../Models/userModel";
import bcrypt from "bcrypt";

export async function getUser(req: Request, res: Response) {
  try {
    const { id: userId } = req.user;
    const { id } = req.params;
    const userDoc = await getUserById(id);
    if (!userDoc) {
      return res
        .status(400)
        .json({ message: "user not found with corresponding id" });
    }
    return res.json({ data: userDoc });
  } catch (err) {
    return res.status(500).json(err);
  }
}

export async function getOwners(req: Request, res: Response) {
  try {
    const { id: userId } = req.user;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const query = {
      role: "OWNER",
    };
    const usersDocs = await getUsersByCondition(query, {}, {}, page, limit);
    if (!usersDocs || usersDocs.length === 0) {
      return res.status(400).json({ message: "owners not found" });
    }
    return res.json({ data: usersDocs });
  } catch (err) {
    return res.status(500).json(err);
  }
}

export async function getCustomers(req: Request, res: Response) {
  try {
    const { id: userId } = req.user;
    const user = req.user;
    const query = {
      role: "CUSTOMER",
    };
    const usersDocs = await getUsersByCondition(query);
    if (!usersDocs || usersDocs.length === 0) {
      return res.status(400).json({ message: "customers not found" });
    }
    return res.json({ data: usersDocs });
  } catch (err) {
    return res.status(500).json(err);
  }
}

export async function createOwner(req: Request, res: Response) {
  try {
    const {
      ownerName,
      phoneNumber,
      email,
      address,
      businessName,
      businessRegNumber,
      businessType,
      gst,
      password,
      countryCode,
      productVariant,
    } = req.body;

    const checkUser = await userModel.findOne(
      { $or: [{ email }, { phNumber: phoneNumber }] },
      { email: 1, phNumber: 1 }
    );
    if (checkUser) {
      const message = { email: false, number: false };
      if (checkUser.email === email) {
        message.email = true;
      }
      if (checkUser.phNumber === phoneNumber) {
        message.number = true;
      }
      return res.status(400).json({
        message: "owner already exists with same credentials",
        data: message,
      });
    }

    let profileImgUrl: string = "";
    if (req.files && Array.isArray(req.files)) {
      const imageUrls = await uploadfiles(req.files);
      profileImgUrl = imageUrls[0];
    }
    const hashedPass = await bcrypt.hash(password, 10);
    const objCreate: Partial<userType> = {
      fullName: ownerName,
      role: "OWNER",
      phNumber: phoneNumber,
      email,
      location: {
        address: address,
      },
      businessDetails: {
        businessName,
        businessRegNumber,
        businessType,
        gst,
      },
      profileUrl: profileImgUrl,
      password: hashedPass,
      countryCode,
    };
    const userDoc = await createUser(objCreate);
    return res.json({ message: "created owner successfully", data: userDoc });
  } catch (err) {
    return res.status(500).json(err);
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const { oldPasswod, newPassword } = req.body;
    const user = await getUserById(req.user.id, { password: 1 });
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }
    const isMatched = await bcrypt.compare(oldPasswod, user.password);
    if (isMatched === false) {
      return res.status(400).json({ message: "password is incorrect" });
    }
    const hashedPass = await bcrypt.hash(newPassword, 10);
    await updateUser({ _id: user._id }, { password: hashedPass });
    return res.json({ message: "changed password successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
}

export async function removeProfileImage(req: Request, res: Response) {
  try {
    const user = req.user;
    const userDoc = await getUserById(user.id);
    await userDoc?.updateOne({ profileUrl: "" });
    return res.json({ message: "removed profile image" });
  } catch (err) {
    return res.status(500).json({ err });
  }
}
