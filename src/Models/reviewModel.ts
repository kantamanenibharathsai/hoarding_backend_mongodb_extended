import mongoose from "mongoose";

export type reviewSchemaType = {
  hoardingId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  ratings: number; // out of five
  review: string;
  status: boolean;
};

const reviewSchema = new mongoose.Schema<reviewSchemaType>(
  {
    hoardingId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    ratings: Number,
    review: String,
    status: Boolean,
  },
  { timestamps: true, versionKey: false }
);

const reviewModel = mongoose.model<reviewSchemaType>("review", reviewSchema);
export default reviewModel;
