import mongoose, { Schema, model } from "mongoose";

export type planT = {
  planName: string;
  duration: string;
  hoardingLimit: number;
  pricePerMonth: number;
  status: boolean;
};

const planSchema = new Schema<planT>(
  {
    planName: {
      type: String,
      required: true,
      unique: true,
    },
    duration: {
      type: String,
      required: true,
    },
    hoardingLimit: {
      type: Number,
      required: true,
    },
    pricePerMonth: {
      type: Number,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

const planModel = model<planT>("plan", planSchema);
export default planModel;
