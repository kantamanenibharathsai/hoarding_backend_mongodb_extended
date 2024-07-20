import mongoose, { Types, Schema } from "mongoose";
import { hoardingType } from "./hoardingModel";
import { featureT } from "./featureModel";

export type bookingType = {
  orderId: string;
  customer: Schema.Types.ObjectId;
  hoarding: Schema.Types.ObjectId;
  owner: Schema.Types.ObjectId;
  price: number;
  advancePayment: string;
  numberOfDays: number;
  bookingDate: Date;
  startDate: Date;
  endDate: Date;
  bookingType: "OFFLINE" | "NORMAL";
  discountPercent: number;
  features: featureT[];
  amountDetails: {
    hoardingAmount: number;
    discount?: number;
    gstAmount: number;
    convenienceFee: number;
    labourCharge: number;
    advancePayment?: number;
    electricityCharge: number;
    maintainenceCharge: number;
    totalAmount: number;
    remainingAmount: number;
    firstPayment: number;
  };
  bookingStatus: "PRINTING" | "DESIGNING" | "PRINTED" | "CANCELLED";
  paymentStatus: string;
  paymentDetails: {
    paymentType: string;
    paymentDate: Date;
    paymentId: string;
  };
  createdAt: Date;
};

const bookingSchema = new Schema<bookingType>(
  {
    orderId: {
      type: String,
    },
    customer: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    hoarding: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "hoarding",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    price: {
      type: Number,
      required: true,
    },
    bookingType: String,
    advancePayment: {
      type: String,
    },
    bookingDate: {
      type: Date,
    },
    startDate: {
      type: Date,
    },
    endDate: Date,
    features: [{ type: { name: String, price: Number } }],
    amountDetails: {
      hoardingAmount: Number,
      advancePayment: Number,
      discount: Number,
      gstAmount: Number,
      convenienceFee: Number,
      labourCharge: Number,
      electricityCharge: Number,
      maintainenceCharge: Number,
      totalAmount: Number,
      remainingAmount: Number,
      firstPayment: Number,
      paidAmount: Number,
    },
    paymentStatus: String,
    bookingStatus: String,
    paymentDetails: {
      paymentDate: Date,
      paymentId: String,
      paymentType: String,
    },
  },
  { versionKey: false, timestamps: true }
);

const bookingModel = mongoose.model<bookingType>("booking", bookingSchema);
export default bookingModel;
