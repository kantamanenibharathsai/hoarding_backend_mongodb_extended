import mongoose, { Schema } from "mongoose";

export type hoardingType = {
  _id: string;
  owner: string;
  name: string;
  location: {
    address: string;
    city?: string;
    country?: string;
    geoLocation?: {
      type: string;
      coordinates: number[];
    };
  };
  dimension: {
    height: string;
    width: string;
  };
  permissions: {
    licenseNumber: string;
    complience?: string;
  };
  costPerDay: number;
  features: string[];
  productVariant: string;
  category: string;
  mainImg: string;
  images: string[];
  status: boolean;
  disabledDate: {
    startDate?: Date;
    endDate?: Date;
  };
  billingInfo: string;
  bookings?: Schema.Types.ObjectId[]; // need to check
  datesBooked: {
    bookingId: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
  }[]; // need to check
  additionalCharges?: {
    convenienceFee: number;
    labourCharges: number;
    electricityCharges: number;
    maintainanceCharges: number;
  };
  discountPercentage: number;
};

const hoardingSchema = new mongoose.Schema<hoardingType>(
  {
    owner: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    dimension: {
      height: String,
      width: String,
    },
    location: {
      address: {
        type: String,
      },
      geoLocation: {
        type: {
          type: String,
          enum: ["Point"],
          required: true,
        },
        coordinates: {
          type: [Number],
        },
      },
      country: String,
      city: String,
    },
    category: String,
    costPerDay: Number,
    features: [String],
    productVariant: String,
    images: [String],
    mainImg: String,
    status: {
      type: Boolean,
      default: true,
    },
    disabledDate: {
      startDate: Date,
      endDate: Date,
    },
    permissions: {
      licenseNumber: String,
      complience: String,
    },
    additionalCharges: {
      labourCharges: Number,
      electricityCharges: Number,
      maintainanceCharges: Number,
      convenienceFee: Number,
    },
    discountPercentage: Number,
    datesBooked: {
      type: [
        {
          bookingId: { type: mongoose.Types.ObjectId, ref: "booking" },
          startDate: Date,
          endDate: Date,
        },
      ],
    },
    bookings: {
      type: [{ type: Schema.Types.ObjectId, ref: "booking" }],
    },
  },
  { versionKey: false, timestamps: true }
);

const hoardingModel = mongoose.model("hoarding", hoardingSchema);

export default hoardingModel;
