import mongoose, { Schema, model } from "mongoose";
import MimeNode from "nodemailer/lib/mime-node";

type tabs = {
  name: string;
  status: boolean;
};

export type sideTabs = {
  _id: string;
  name: string;
  tabs: tabs[];
  status: boolean;
  plan: {
    name: string;
    id: mongoose.Types.ObjectId;
  };
  role: "OWNER" | "SALES" | "CUSTOMER" | "ADMIN";
};

const sideTabsSchema = new Schema<sideTabs>(
  {
    name: {
      type: String,
      required: true,
    },
    status: Boolean,
    tabs: [{ name: { type: String, unique: true }, status: Boolean }],
    plan: {
      name: String,
      id: {
        type: mongoose.Types.ObjectId,
        ref: "plan",
      },
    },
    role: {
      type: String,
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

const sideMenuModel = model("sidemenu", sideTabsSchema);
export default sideMenuModel;
