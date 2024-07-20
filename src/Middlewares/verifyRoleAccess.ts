import { userType } from "../Models/userModel";
import { NextFunction, Request, Response } from "express";

export function verifyRoleAccess(roles: string[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    const userRole = req.user.role;
    const checkRole = roles.find((role) => role === userRole);
    if (!checkRole || checkRole === undefined) {
      return res
        .status(401)
        .json({ message: "you do not have access to this resource" });
    }
    return next();
  };
}
