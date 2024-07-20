import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { isString } from "../helpers/validateutils";
import userModel from "../Models/userModel";

export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization;
    if (!token || !isString(token) || token === "") {
      return res
        .status(400)
        .json({ message: "invalid token sent please check" });
    }
    const secretKey = process.env.JWTSECRETKEY ? process.env.JWTSECRETKEY : "";
    const jwtRes = jwt.verify(token, secretKey);
    if (typeof jwtRes !== "string") {
      const user = jwtRes;
      const userDoc = await userModel.findOne({ _id: user._id }, { role: 1 });
      if (userDoc) {
        req.user = { id: user._id, email: user.email, role: userDoc?.role };
        return next();
      }
      return res
        .status(500)
        .json({ message: "user not found , please check the token" });
    }
  } catch (err) {
    return res.status(500).json({ err });
  }
}
