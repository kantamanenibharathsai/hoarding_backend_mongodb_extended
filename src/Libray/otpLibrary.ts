import { sendMail } from "./mailLibrary";
import userModel from "../Models/userModel";
import { generateJwtToken } from "./userLibrary";
import { getUserById } from "./userLibrary";

export type sendOtpT = {
  email: string;
  text: string;
  subject: string;
  fromMail?: string;
};

export async function sendOtp({ email, text, subject, fromMail }: sendOtpT) {
  try {
    const createdAt = Date.now();
    const otp = otpGenerator();
    text = text.replace("//otp//", otp.toString());
    await sendMail({ email, text, subject, fromMail });
    return Promise.resolve({ otp, createdAt });
  } catch (err) {
    return Promise.reject(err);
  }
}

type verifyForgetPassOtpT = {
  otp: string;
  userId: string;
};
export async function verifyForgetPassOtp(data: verifyForgetPassOtpT) {
  try {
    const time = 60000;
    const userDoc = await userModel.findOne(
      { _id: data.userId },
      { resetPassword: 1, email: 1 }
    );
    if (!userDoc) {
      throw { message: "user is not found" };
    }
    if (!userDoc.resetPassword.otp || !userDoc.resetPassword.createdAt) {
      throw { message: "user has not generated any otp" };
    }
    const currentTime = Date.now();
    if (currentTime - Number(userDoc.resetPassword.createdAt) > time) {
      throw { message: "otp is expired please try again" };
    }
    if (data.otp !== userDoc.resetPassword.otp) {
      throw { message: "otp is not matching try again" };
    }
    const token = generateJwtToken({ _id: userDoc._id, email: userDoc.email });
    return Promise.resolve(token);
  } catch (err) {
    return Promise.reject(err);
  }
}

//get user
// check
export async function verifyEmail(data: { otp: string; userId: string }) {
  try {
    const TIME = 60000;
    const userDoc = await getUserById(data.userId, { verification: 1 });
    if (!userDoc) {
      return Promise.reject({ err: "user not found" });
    }
    if (!userDoc.verification?.otp || !userDoc?.verification?.createdAt) {
      throw { message: "OTP is not generated , generate an otp first" };
    }
    const sentOtp = userDoc.verification?.otp;
    const sentTime = Number(userDoc.verification?.createdAt);
    const currentTime = Date.now();
    if (currentTime - sentTime > TIME)
      throw { message: "otp is expired generate new one" };
    if (sentOtp !== data.otp)
      throw { message: "otp is not matching try again" };
    await userDoc.updateOne({ verified: true });
    const token = generateJwtToken({ _id: userDoc._id, email: userDoc.email });
    return Promise.resolve(token);
  } catch (err) {
    return Promise.reject(err);
  }
}

export function otpGenerator(): number {
  const randomNum = Math.floor(Math.random() * 8000) + 1000;
  return randomNum;
}
