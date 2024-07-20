import mongoose, { Schema, model, Types } from "mongoose";

type termsT = {
  _id: string;
  role: string;
  termsAndConditon: string;
};

const termsSchema = new Schema<termsT>({
  role: {
    type: String,
    required: true,
  },
  termsAndConditon: String,
});

const termsModel = model<termsT>("termsAndConditons", termsSchema);

export default termsModel;
