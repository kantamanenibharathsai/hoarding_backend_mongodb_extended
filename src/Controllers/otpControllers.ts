import { Request, Response } from "express";
import { verifyForgetPassOtp, verifyEmail } from "../Libray/otpLibrary";

// refactor this to verify for calls,mails and for account verification,login,two factor,forgot password
type verificationT =
  | "forgotPassword"
  | "SMSverifcation"
  | "EMAILverification"
  | "login";
export async function verifyOtp(req: Request, res: Response) {
  try {
    // write library functions
    // validate sms otp --> verification
    // verify mail otp  --> verification
    // verify forget otp --> add new field
    // verify login otp   --> add field in two factor auth

    const { otp, userId } = req.body;
    const verificationType: verificationT = req.body.verificationType;
    switch (verificationType) {
      case "forgotPassword": {
        const token = await verifyForgetPassOtp({ otp, userId });
        return res.json({ message: "otp verified successfully", token: token });
      }
      // case "SMSverifcation": {
      // }
      case "EMAILverification": {
        const token = await verifyEmail({ otp, userId });
        return res.json({ message: "otp verified successfully", token });
      }
      // case "login": {
      // }
      default: {
        return res.json({ message: "invalid verification type" });
      }
    }
  } catch (err) {
    return res.status(400).json(err);
  }
}
