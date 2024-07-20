import mongoose, { Schema, model } from "mongoose";

export type countryCodeType = {
  countryName: string;
  countryCode: string;
  countryShortName: string;
};

const countrySchema = new Schema<countryCodeType>(
  {
    countryName: {
      type: String,
      uppercase: true,
      required: true,
    },
    countryCode: {
      type: String,
    },
    countryShortName: String,
  },
  { versionKey: false, timestamps: true }
);

const countryModel = model<countryCodeType>("countryCode", countrySchema);
export default countryModel;
