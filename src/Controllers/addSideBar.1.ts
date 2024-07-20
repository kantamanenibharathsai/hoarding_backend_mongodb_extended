import { Request, Response } from "express";
import sideBarModel from "../Models/sidebarModel";

export async function addSideBar(req: Request, res: Response) {
  try {
    const user = req.user;
    const { role, planId, planName, sideBarName, sideMenuArr } = req.body;
    const sideBarDoc = await sideBarModel.findOne({
      name: sideBarName,
      role: role,
      "planType.planId": planId,
    });

    if (sideBarDoc) {
      return res.json({ message: "sidebar with role and plan already exists" });
    }
    const objCreate = {
      name: sideBarName,
      role,
      planType: {
        planName,
        planId,
      },
      sideMenu: sideMenuArr,
    };
    const sideBar = await sideBarModel.create(objCreate);
    return res.status(500).json({
      message: `sidebar created for the ${role} with plan ${planName}`,
      data: sideBar,
    });
  } catch (err) {
    return res.status(500).json({ err });
  }
}
