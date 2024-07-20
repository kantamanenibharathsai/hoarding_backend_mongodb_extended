import mongoose, { Schema } from "mongoose";

export type notificationT = {
  _id: string;
  recipent: Schema.Types.ObjectId;
  sender: Schema.Types.ObjectId;
  read: boolean;
  message: string;
  bookingId: Schema.Types.ObjectId;
};

const notificationSchema = new mongoose.Schema<notificationT>(
  {
    recipent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "booking" },
    message: { type: String },

    read: { type: Boolean, default: false },
  },
  { versionKey: false, timestamps: true }
);

const notificationModel = mongoose.model<notificationT>(
  "notification",
  notificationSchema
);

export default notificationModel;
