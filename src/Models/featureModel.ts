import mongoose, { Schema, model } from "mongoose";

export type featureT = {
  name: string;
  price: number;
};

const featureSchema = new Schema<featureT>(
  {
    name: String,
    price: Number,
  },
  { versionKey: false, timestamps: true }
);

const featureModel = model<featureT>("feature", featureSchema);
export default featureModel;
