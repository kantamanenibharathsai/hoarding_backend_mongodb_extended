import mongoose, { Schema, model } from "mongoose";

export type privacyPolicyT = {
  role: string;
  privacyPolicy: string;
};

const privacyPolicySchema = new Schema<privacyPolicyT>(
  {
    role: {
      type: String,
      required: true,
    },
    privacyPolicy: String,
  },
  { versionKey: false, timestamps: true }
);

const privacyPolicyModel = model<privacyPolicyT>(
  "privacyPolicy",
  privacyPolicySchema
);
export default privacyPolicyModel;
