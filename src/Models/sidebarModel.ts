import mongoose, { Schema, model } from "mongoose";
import { sideTabs } from "./sideMenuModel";

export type sideBars = {
  role: "OWNER" | "SALES" | "CUSTOMER" | "ADMIN";
  _id: string;
  planType: {
    planName: string;
    planId: mongoose.Types.ObjectId;
  };
  sideMenu: sideTabs[];
  status: boolean;
};

const sideBarSchema = new Schema<sideBars>(
  {
    role: {
      type: String,
      required: true,
    },
    planType: {
      planName: String,
      planId: {
        type: mongoose.Types.ObjectId,
        required: true,
      },
    },
    status: {
      type: Boolean,
      default: true,
    },
    sideMenu: [
      { name: String, id: { type: mongoose.Types.ObjectId, ref: "sidemenu" } },
    ],
  },
  { versionKey: false, timestamps: true }
);

const sideBarModel = model<sideBars>("sidebar", sideBarSchema);
export default sideBarModel;
