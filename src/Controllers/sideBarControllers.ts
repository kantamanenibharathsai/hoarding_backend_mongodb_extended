import { Request, Response } from "express";
import sideMenuModel from "../Models/sideMenuModel";
import sideBarModel from "../Models/sidebarModel";
import { getPlanById } from "../Libray/planLibrary";
import mongoose, { mongo, Types } from "mongoose";
import { getUserById } from "../Libray/userLibrary";
import { userPlan } from "../Models/userModel";
export async function addSideBar(req: Request, res: Response) {
  try {
    const user = req.user;
    const { role, planId, planName, sideMenuArr, status } = req.body;
    const sideBarDoc = await sideBarModel.findOne({
      role: role,
      "planType.planId": planId,
    });
    if (sideBarDoc) {
      return res.json({ message: "sidebar with role and plan already exists" });
    }
    const prmArr = sideMenuArr.map((item: string) => {
      return sideMenuModel.findOne({ name: item, role, "plan.name": planName });
    });
    const prmResult = await Promise.all(prmArr);
    let invalidSMNames: any[] = [];
    prmResult.forEach((sidemenu, idx) => {
      if (sidemenu === null || sidemenu === undefined) {
        invalidSMNames.push({
          error: `sidemenu ${sideMenuArr[idx]} doesn't exists, either remove or create new sidemenu`,
        });
      }
    });
    if (invalidSMNames.length > 0) {
      return res.status(500).json({ err: invalidSMNames });
    }
    const sideMenuCreate = prmResult.map((item) => {
      return { name: item.name, id: item._id };
    });
    const objCreate = {
      role,
      planType: {
        planName,
        planId,
      },
      sideMenu: sideMenuCreate,
      status,
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

export async function createSideMenu(req: Request, res: Response) {
  try {
    const { name, tabs, planId, role } = req.body;
    const sidemenuDoc = await sideMenuModel.findOne({
      "plan.id": planId,
      role,
      name,
    });
    if (sidemenuDoc)
      return res.status(400).json({ message: "sidemenu already exists" });
    const planDetails = await getPlanById(planId);
    if (!planDetails) {
      return res.status(400).json({ message: "plan not found" });
    }
    const tabsData = tabs.map((item: string) => {
      return { name: item, status: true };
    });
    const objCreate = {
      name,
      role,
      plan: {
        name: planDetails.planName,
        id: planDetails._id,
      },
      tabs: tabsData,
    };
    const sidemenu = await sideMenuModel.create(objCreate);

    return res.json({ message: "sidemen created ", data: sidemenu });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function deleteSideBar(req: Request, res: Response) {
  try {
    const { sideBarId } = req.params;
    const sideBar = await sideBarModel.findOne({ _id: sideBarId });
    if (sideBar === null) {
      return res.json({ message: "sidebar with id not found" });
    }
    await sideBarModel.deleteOne({ _id: sideBarId });
    return res.json({ message: "sidebar deleted successfully" });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function deleteSideMenu(req: Request, res: Response) {
  const session = await mongoose.startSession();
  try {
    const { sidemenuId } = req.params;

    const sidemenu = await sideMenuModel.findOne({ _id: sidemenuId });
    if (!sidemenu) {
      return res.status(400).json({ message: "sidemenu with id is not found" });
    }
    const sideBar = await sideBarModel.findOne({
      role: sidemenu.role,
      "planType.planName": sidemenu.plan.name,
    });
    if (sideBar) {
      session.startTransaction();
      const objUpdate = {
        $pull: {
          sidemenu: {
            id: sidemenu._id,
          },
        },
      };
      await Promise.all([
        sideMenuModel.deleteOne({ _id: sidemenuId }),
        sideBarModel.updateOne({ _id: sideBar._id }, objUpdate),
      ]);
      session.commitTransaction();
    }
    await sideMenuModel.deleteOne({ _id: sidemenuId });
    return res.json({ message: "sidemenu deleted successfully" });
  } catch (err) {
    if (session) session.abortTransaction();
    return res.status(500).json({ err });
  }
}

export async function removeSideMenu(req: Request, res: Response) {
  try {
    const { sideBarId } = req.params;
    const { sideMenuIds } = req.body;

    const sideBar = await sideBarModel.findOne({ _id: sideBarId });
    if (!sideBar) {
      return res
        .status(400)
        .json({ message: "sidebar with corresponding id not found" });
    }
    let sideMenuIdsCmp = sideMenuIds.map((item: string) => {
      return new Types.ObjectId(item);
    });
    const objUpdate = {
      $pull: {
        sideMenu: {
          id: {
            $in: sideMenuIdsCmp,
          },
        },
      },
    };
    await sideBarModel.updateOne({ _id: sideBar._id }, objUpdate);

    return res.json({ message: "removed sidemenu from the sidebar" });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function updateSidemenu(req: Request, res: Response) {
  try {
    const payload = req.body;
    const { sideBarId } = req.params;
    const sideMenuFields = ["name", "status", "tabs"];
    let objUpdate: { [key: string]: any } = {};
    sideMenuFields.forEach((item) => {
      if (payload[item]) {
        objUpdate[item] = payload[item];
      }
    });
    const data = await sideMenuModel.findOne({ _id: sideBarId });
    if (data === null) {
      return res.status(400).json({ message: "sidebar with id not found" });
    }
    await data.updateOne({ _id: sideBarId }, objUpdate);
    return res.json({ message: "updated sidemenu successfully" });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function deleteTab(req: Request, res: Response) {
  try {
    const { tabName } = req.body;
    const { sideMenuId } = req.params;
    const sideMenu = await sideMenuModel.findOne({ _id: sideMenuId });
    const objUpdate = {
      $pull: {
        tabs: {
          name: tabName,
        },
      },
    };
    await sideMenu?.updateOne(objUpdate);
    return res.json({ message: "tab removed" });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function getSidebars(req: Request, res: Response) {
  try {
    const user = req.user;
    const userDoc = await getUserById(user.id, { activePlan: 1 });
    let isUserSubscribed = false;
    let planDeatails: userPlan = { plan: "default", planId: "" };
    if (
      userDoc?.activePlan.plan !== undefined &&
      userDoc.activePlan.planId !== undefined
    ) {
      planDeatails.plan = userDoc.activePlan.plan;
      planDeatails.planId = userDoc.activePlan.planId;
      isUserSubscribed = true;
    }
    const sideBar = await sideBarModel
      .findOne({ role: user.role, "planType.planName": planDeatails.plan })
      .populate("sideMenu.id");
    if (sideBar === null || sideBar === undefined) {
      return res.json({ message: "no sidebar exists for this user" });
    }
    return res.json({ data: sideBar });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function getSideMenu(req: Request, res: Response) {
  try {
    const user = req.user;
    const userDoc = await getUserById(user.id, { activePlan: 1 });
    let isUserSubscribed = false;
    let planDeatails: userPlan = { plan: "default", planId: "" };
    if (
      userDoc?.activePlan.plan !== undefined &&
      userDoc.activePlan.planId !== undefined
    ) {
      planDeatails.plan = userDoc.activePlan.plan;
      planDeatails.planId = userDoc.activePlan.planId;
      isUserSubscribed = true;
    }
    const sideMenu = await sideMenuModel.find({
      role: user.role,
      "plan.name": planDeatails.plan,
    });

    return res.json({ data: sideMenu });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function addSideMenu(req: Request, res: Response) {
  try {
    const { sideMenuId, sideBarId } = req.body;
    const [sideMenu, sideBar] = await Promise.all([
      sideMenuModel.findOne({ _id: sideMenuId }),
      sideBarModel.findOne({ _id: sideBarId }),
    ]);
    if (sideMenu === null)
      return res.status(400).json({ message: "sidemenu not found" });
    if (sideBar === null)
      return res.status(400).json({ message: "sidebar not found" });

    if (
      sideBar.role !== sideMenu.role ||
      sideBar.planType.planName !== sideMenu.plan.name
    ) {
      return res.status(400).json({
        message:
          "sidebar and side menu is not compaitable.Either plan or role is not matching",
      });
    }

    const sideMenuObj = sideBar.sideMenu.find((item) => {
      return item._id === sideMenuId;
    });

    if (sideMenuObj) {
      return res
        .status(200)
        .json({ message: "sidemenu already exists in the sidebar" });
    }
    const objUpdate = {
      $push: {
        sideMenu: {
          name: sideMenu.name,
          id: sideMenu._id,
        },
      },
    };
    await sideBar.updateOne(objUpdate);
    const sidebarDoc = await sideBarModel.findOne({ _id: sideBar._id });
    return res.json({
      message: "sidemenu addedd successfully to sidebar",
      data: sidebarDoc,
    });
  } catch (err) {
    return res.status(500).json({ err });
  }
}
