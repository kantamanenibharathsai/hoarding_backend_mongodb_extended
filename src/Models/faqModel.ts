import mongoose, { Schema, model } from "mongoose";

export type faqT = {
  question: string;
  answer: string;
  addedBy: mongoose.Types.ObjectId;
};

const faqSchema = new Schema<faqT>(
  {
    question: String,
    answer: String,
    addedBy: Schema.Types.ObjectId,
  },
  { versionKey: false, timestamps: true }
);

const faqModel = model<faqT>("faq", faqSchema);
export default faqModel;
