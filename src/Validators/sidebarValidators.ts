import { NextFunction, Request, Response } from "express";
import { isArray, isString } from "../helpers/validateutils";
import mongoose from "mongoose";
export function validateAddSideBar(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { role, planId, planName, sideMenuArr, status } = req.body;
  const Errors = [];
  const objectId = mongoose.Types.ObjectId;
  if (!role) {
    Errors.push({ message: "role field is empty" });
  }
  if (role && !isString(role)) {
    Errors.push({ message: "role field is not a string" });
  }
  if (!planName) {
    Errors.push({ message: "planName field is empty" });
  }
  if (planName && !isString(planName)) {
    Errors.push({ message: "planName field is not a string" });
  }
  if (planId && !isString(planId)) {
    Errors.push({ message: "planId is not a string" });
  }
  if (planId && objectId.isValid(planId)) {
    Errors.push({ message: "planId is not a valid objectId" });
  }
  if (sideMenuArr && !isArray(sideMenuArr)) {
    Errors.push({ message: "sideMenuArr is not a valid array" });
  }
  if (
    status === undefined ||
    (status === null && typeof status !== "boolean")
  ) {
    Errors.push({ message: "status is not a boolean value" });
  }
  if (Errors.length > 0) {
    return res.status(500).json(Errors);
  }
  return next();
}

export function validateCreateSideMenu(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { name, tabs, planId, role } = req.body;
  const Errors = [];
  const objectId = mongoose.Types.ObjectId;
  if (!role) {
    Errors.push({ message: "role field is empty" });
  }
  if (role && !isString(role)) {
    Errors.push({ message: "role field is not a string" });
  }
  if (!name) {
    Errors.push({ message: "name field is empty" });
  }
  if (name && !isString(name)) {
    Errors.push({ message: "name field is not a string" });
  }
  if (!planId) {
    Errors.push({ message: "planId field is empty" });
  }
  if (planId && !isString(planId)) {
    Errors.push({ message: "planId is not a string" });
  }
  if (planId && objectId.isValid(planId)) {
    Errors.push({ message: "planId is not a valid objectId" });
  }
  if (tabs && !isArray(tabs)) {
    Errors.push({ message: "tabs field is not an array" });
  }
  const nonStringData = tabs.find((item: any) => {
    return typeof item !== "string";
  });
  if (nonStringData) {
    Errors.push({ message: "tabs array have non string elements" });
  }
  if (Errors.length > 0) {
    return res.status(500).json(Errors);
  }
  return next();
}

export function validateDeleteSideBar(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { sideBarId } = req.params;
  const Errors = [];
  const objectId = mongoose.Types.ObjectId;
  if (sideBarId && !isString(sideBarId)) {
    Errors.push({ message: "sidebarId is not a string" });
  }
  if (objectId && objectId.isValid(sideBarId)) {
    Errors.push({ message: "sideBarId is not a valid docuement id" });
  }
  if (Errors.length > 0) {
    return res.status(500).json(Errors);
  }
  return next();
}

export function validateDeleteSideMenu(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { sidemenuId } = req.params;
  const Errors = [];
  const objectId = mongoose.Types.ObjectId;
  if (sidemenuId && !isString(sidemenuId)) {
    Errors.push({ message: "sidemenuId is not a string" });
  }
  if (objectId && objectId.isValid(sidemenuId)) {
    Errors.push({ message: "sidemenuId is not a valid docuement id" });
  }
  if (Errors.length > 0) {
    return res.status(500).json(Errors);
  }
  return next();
}

export function removeSideMenu(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { sideBarId } = req.params;
  const { sideMenuIds } = req.body;

  const Errors = [];
  const objectId = mongoose.Types.ObjectId;
  if (sideBarId && !isString(sideBarId)) {
    Errors.push({ message: "sideBarId is not a string" });
  }
  if (objectId && objectId.isValid(sideBarId)) {
    Errors.push({ message: "sideBarId is not a valid docuement id" });
  }
  if (!sideMenuIds) {
    Errors.push({ message: "sideMenuIds field is empty" });
  }
  if (!isArray(sideMenuIds)) {
    Errors.push({ message: "sideMenusIds is not a array" });
  }
  if (sideMenuIds && sideMenuIds.length === 0) {
    Errors.push({ message: "sideMenuIds dosn't have any data" });
  }
  if (Errors.length > 0) {
    return res.status(500).json(Errors);
  }
  return next();
}

export function validateAddSideMenu(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { sideMenuId, sideBarId } = req.body;

  const Errors = [];
  const objectId = mongoose.Types.ObjectId;
  if (!sideMenuId) {
    Errors.push({ message: "sideMenuId field is empty" });
  }
  if (!sideBarId) {
    Errors.push({ message: "sideBarId field is empty" });
  }
  if (sideBarId && !isString(sideBarId)) {
    Errors.push({ message: "sideBarId is not a string" });
  }
  if (objectId && objectId.isValid(sideBarId)) {
    Errors.push({ message: "sideBarId is not a valid docuement id" });
  }
  if (sideMenuId && !isString(sideMenuId)) {
    Errors.push({ message: "sideMenuId is not a string" });
  }
  if (objectId && objectId.isValid(sideMenuId)) {
    Errors.push({ message: "sideMenuId is not a valid docuement id" });
  }
  if (Errors.length > 0) {
    return res.status(500).json(Errors);
  }
  return next();
}

export function validateDeleteTab(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { tabName } = req.body;
  const { sideMenuId } = req.params;
  const Errors = [];
  const objectId = mongoose.Types.ObjectId;
  if (!tabName) {
    Errors.push({ message: "tabName field is empty" });
  }
  if (tabName && !isString(tabName)) {
    Errors.push({ message: "tabName is not a string" });
  }
  if (objectId && objectId.isValid(sideMenuId)) {
    Errors.push({ message: "sideMenuId is not a valid docuement id" });
  }
  if (Errors.length > 0) {
    return res.status(500).json(Errors);
  }
  return next();
}

export function validateUpdateSidemenu(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { name, status, tabs } = req.body;
  const { sideBarId } = req.params;
  const Errors = [];
  if (name && !isString(name)) {
    Errors.push({ message: "errors is not a string" });
  }
  if (status !== undefined && status !== null && typeof status !== "boolean") {
    Errors.push({ message: "status is not a boolean value" });
  }
  if (tabs && !isArray(tabs)) {
    Errors.push({ message: "tabs is not a array" });
  }

  if (Errors.length > 0) {
    return res.status(500).json(Errors);
  }
  return next();
}
