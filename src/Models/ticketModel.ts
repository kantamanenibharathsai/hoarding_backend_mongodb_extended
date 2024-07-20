import mongoose, { Schema } from "mongoose";

export type ticketType = {
  user: {
    name: string;
    email: string;
    id: Schema.Types.ObjectId;
  };

  status: string;
  query: string;
  date: Date;
  solution?: string;
  answeredBy?: {
    name: string;
    email: string;
    id: Schema.Types.ObjectId;
  };
  answeredDate?: Date;
  subject: string;
  bookingId: Schema.Types.ObjectId;
};

const ticketSchema = new Schema<ticketType>(
  {
    user: {
      name: String,
      id: {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    },

    status: {
      type: String,
      default: "pending",
    },
    query: String,
    subject: String,
    date: Date,
    answeredBy: {
      name: String,
      id: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    },
    answeredDate: Date,
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "bookings",
    },
  },
  { versionKey: false, timestamps: true }
);

const ticketModel = mongoose.model("ticket", ticketSchema);
export default ticketModel;
