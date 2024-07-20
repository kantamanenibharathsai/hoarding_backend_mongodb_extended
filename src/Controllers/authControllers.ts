import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import userModel from "../Models/userModel";
import {
  addDefaultuserPreferences,
  addUserChat,
  generateJwtToken,
  getUserById,
  updateUser,
} from "../Libray/userLibrary";
import { sendOtp, otpGenerator } from "../Libray/otpLibrary";
import { getPlan } from "../Libray/planLibrary";
import { getSideBarByCondition } from "../Libray/sidebarLibrary";
import userPreferenceModal from "../Models/userPreferences";
import languageModel from "../Models/languageModel";
import sideBarModel from "../Models/sidebarModel";

export async function signUp(req: Request, res: Response) {
  try {
    // #swagger.tags = ['auth']
    const { fullName, email, phNumber, role, password } = req.body;
    const checkUser = await userModel.findOne(
      { $or: [{ email }, { phNumber }] },
      { email: 1, phNumber: 1 }
    );
    if (checkUser) {
      const message = { email: false, number: false };
      if (checkUser.email === email) {
        message.email = true;
      }
      if (checkUser.phNumber === phNumber) {
        message.number = true;
      }
      return res
        .status(400)
        .json({ message: "credentials  already present", data: message });
    }

    const mailText = `Otp for veriying your account is  //otp//`;
    const { otp, createdAt } = await sendOtp({
      email,
      subject: "signup verification",
      text: mailText,
    });
    const hashedPass = await bcrypt.hash(password, 10);
    const planDetails = await getPlan({ plan: "default" });
    const userDoc = await userModel.create({
      fullName,
      email,
      phNumber,
      role,
      password: hashedPass,
      verification: { otp, createdAt },
      activePlan: {
        plan: planDetails?.planName,
        planId: planDetails?._id,
      },
    });

    let userPreference;
    try {
      userPreference = await addDefaultuserPreferences(userDoc._id);
      addUserChat(userDoc._id, userDoc.fullName);
    } catch (err) {
      console.log("failed to create userPreferences");
    }

    return res.status(201).json({
      message: "user signedUp successfully",
      data: {
        id: userDoc._id,
        email: userDoc.email,
        userPreferences: userPreference,
      },
    });
  } catch (err) {
    return res.status(500).json(err);
  }
}

export async function login(req: Request, res: Response) {
  try {
    // #swagger.tags = ['auth']
    const { email, password, fcmToken } = req.body;
    const userDoc = await userModel.findOne(
      { email },
      { _id: 1, email: 1, password: 1, verified: 1, two_factorAuth: 1, role: 1 }
    );
    if (!userDoc) {
      return res
        .status(400)
        .json({ message: "user is not found please check the email" });
    }
    if (userDoc.verified === false) {
      const mailText = `your otp for account verification  is //otp//`;
      const { otp, createdAt } = await sendOtp({
        email,
        text: mailText,
        subject: "verify account",
      });
      await userDoc.updateOne({ verification: { otp, createdAt } });
      return res.json({
        message:
          "email is not verified,an otp is sent to mail please verify first",
      });
    }
    const isMatched = await bcrypt.compare(password, userDoc.password);
    if (isMatched == false)
      return res
        .status(200)
        .json({ message: "password is incorrect,try again" });

    if (userDoc.two_factorAuth === true) {
      // handle two factor authentication
    }
    const userPlanName = userDoc.activePlan.plan
      ? userDoc.activePlan.plan
      : "default";
    const [sideBar, user] = await Promise.all([
      getSideBarByCondition({
        "planType.planName": userPlanName,
        role: userDoc.role,
      }),
      getUserById(userDoc._id),
    ]);
    await userModel.updateOne({ _id: userDoc._id }, { fcmToken: fcmToken });
    const token = generateJwtToken({ _id: userDoc._id, email: userDoc.email });
    const sidbarDetals = await sideBarModel.findOne({ role: userDoc.role });
    const data = {
      userData: user,
      sideBar: sideBar,
      token,
      sidbar: sidbarDetals,
    };
    return res.status(200).json({ message: "loggedIn successully", data });
  } catch (err) {
    res.status(500).json(err);
  }
}

export async function logOut(req: Request, res: Response) {
  try {
    // #swagger.tags = ['auth']
    const user = req.user;
    await updateUser({ _id: user.id }, { fcmToken: "" });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    // #swagger.tags = ['auth']
    const { email } = req.body;
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "user is not found, please check email" });
    }
    const { otp, createdAt } = await sendOtp({
      email,
      text: "your otp is //otp//",
      subject: "res et password mail otp",
    });
    await user.updateOne({ resetPassword: { otp, createdAt } });
    return res.json({
      message: "otp has sent to reset password",
      data: { userId: user._id },
    });
  } catch (err) {
    return res.status(500).json(err);
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const { newPassword } = req.body;
    // #swagger.tags = ['auth']

    //get user from userId;
    const user = req.user;
    const userId = user?.id;
    const userDoc = await userModel.findOne({ _id: userId });
    if (!userDoc) {
      return res
        .status(400)
        .json({ message: "user not found please login again" });
    }
    const hashedPass = await bcrypt.hash(newPassword, 10);
    await userDoc.updateOne({ password: hashedPass });
    return res.json({ message: "updated password successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
}
