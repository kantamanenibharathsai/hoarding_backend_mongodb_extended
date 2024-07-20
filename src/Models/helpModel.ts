import mongoose, { Schema, model } from "mongoose";

export type helpT = {
  query: string;
  raisedBy: mongoose.Types.ObjectId;
  answeredBy?: mongoose.Types.ObjectId;
  answered: boolean;
  answer: string;
};

const helpSchema = new Schema<helpT>(
  {
    query: {
      type: String,
      required: true,
    },
    raisedBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    answeredBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    answered: {
      type: Boolean,
      default: false,
    },
    answer: String,
  },
  { versionKey: false, timestamps: true }
);

const helpModel = model<helpT>("help", helpSchema);
export default helpModel;
