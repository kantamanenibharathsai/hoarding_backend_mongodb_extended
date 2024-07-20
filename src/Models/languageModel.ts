import mongoose, { Types, Schema } from "mongoose";

export type languageType = {
  name: string;
  createdBy: mongoose.Types.ObjectId;
};

const languageSchema = new Schema<languageType>(
  {
    name: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

const languageModel = mongoose.model<languageType>("language", languageSchema);
export default languageModel;
