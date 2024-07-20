import mongoose, { Schema, model } from "mongoose";

export type categoryT = {
  name: string;
  image: string;
};

const categorySchema = new Schema<categoryT>(
  {
    name: String,
    image: String,
  },
  { versionKey: false, timestamps: true }
);

const categoryModel = model<categoryT>("categories", categorySchema);
export default categoryModel;
