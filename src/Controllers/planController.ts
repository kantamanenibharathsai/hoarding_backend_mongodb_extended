import { getUserById } from "../Libray/userLibrary";
import planModel, { planT } from "../Models/planModel";
import { ADMIN } from "../helpers/constants";
import {
  createPlan,
  getPlanById,
  updatePlanByCondition,
  deletePlanById,
  getPlansByCondition,
} from "../Libray/planLibrary";
import { Request, Response } from "express";
import { verifyRoleAccess } from "../Middlewares/verifyRoleAccess";

export async function getPlans(req: Request, res: Response) {
  try {
    const plans = await planModel.find({});
    return res.json({ data: plans });
  } catch (err) {
    return res.status(500).json(err);
  }
}

export async function updatePlan(req: Request, res: Response) {
  try {
    const payload = req.body;
    const { planId } = req.params;
    const planFields = [
      "planName",
      "duration",
      "hoardingLimit",
      "pricePerMonth",
      "status",
    ];
    let objCreate: { [key: string]: string | number | boolean } = {};
    planFields.forEach((planKey) => {
      if (payload[planKey] !== undefined) {
        objCreate[planKey] = payload[planKey];
      }
    });
    await updatePlanByCondition({ _id: planId }, { ...objCreate, fine: false });
    return res.json({ message: "updated plan successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
}
export async function togglePlanStatus(req: Request, res: Response) {
  try {
    const { planId } = req.params;
    const { status } = req.body;
    const { id: userId } = req.user;
    const plan = await getPlanById(planId);
    if (!plan) {
      return res
        .status(400)
        .json({ message: "plan not found with correspondin plan Id" });
    }
    await updatePlanByCondition({ _id: planId }, { $set: { status } });
    return res.json({ message: "updated status" });
  } catch (err) {
    return res.status(500).json(err);
  }
}
export async function deletePlan(req: Request, res: Response) {
  try {
    const { planId } = req.params;

    await deletePlanById(planId);
    return res.json({ message: "deleted plan successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
}
export async function addPlan(req: Request, res: Response) {
  try {
    const { id: userId } = req.user;
    const { planName, duration, pricePerMonth, hoardingLimit } = req.body;

    const planDoc = await getPlansByCondition(
      { planName: planName },
      { planName: 1 }
    );
    if (planDoc.length > 0) {
      return res.status(400).json({
        message: "plan name already exists, please try again with another name",
      });
    }
    const objCreate: planT = {
      planName,
      duration,
      pricePerMonth,
      status: true,
      hoardingLimit,
    };
    const plan = await createPlan(objCreate);
    return res.json({ message: "created plan successfully", data: plan });
  } catch (err) {
    return res.status(500).json(err);
  }
}
