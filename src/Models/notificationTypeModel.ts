import mongoose from "mongoose";

export type notificationTypeT = {
  _id: string;
  name: string;
  description: string;
  role: "ADMIN" | "CUSTOMER" | "SELLER" | "OWNER";
  shortName: string;
};

const notificationTypesSchema = new mongoose.Schema<notificationTypeT>(
  {
    name: String,
    description: String,
    role: String,
    shortName: String,
  },
  { versionKey: false, timestamps: true }
);

const notificationTypesModel = mongoose.model<notificationTypeT>(
  "notificationTypes",
  notificationTypesSchema
);

export default notificationTypesModel;
