import mongoose, { Schema } from "mongoose";

export type userPlan = {
  plan: string;
  planId: string;
};
export type userType = {
  _id?: string;
  fullName: string;
  email: string;
  phNumber: string;
  gender: string;
  role: "OWNER" | "ADMIN" | "SALES" | "CUSTOMER";
  password: string;
  verified: boolean;
  two_factorAuth: boolean;
  verification: {
    createdAt: string;
    otp: string;
  };
  resetPassword: {
    otp: string;
    createdAt: string;
  };
  fcmToken: string;
  hoardings: string[];
  username: string;
  profileUrl: string;
  activePlan: userPlan;
  isActive: boolean;
  location: {
    city?: string;
    district?: string;
    state?: string;
    country?: string;
    pincode?: string;
    address?: string;
    geoLocation?: {
      type: string;
      coordinates: [number, number];
    };
  };
  favoriteHoardings: mongoose.Types.ObjectId[];
  billings: {
    invoices: string[];
    taxinfo: string[];
  };
  twoStepVerification: boolean;
  emailSetup: boolean;
  smsSetup: boolean;
  businessDetails: {
    businessName: string;
    businessRegNumber: number;
    businessType: string;
    gst: string;
  };
  countryCode: string;
  recentlyViewed: mongoose.Types.ObjectId[];
};

const userSchema = new mongoose.Schema<userType>(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },
    phNumber: {
      type: String,
      unique: true,
    },
    gender: String,
    username: String,
    role: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      select: false,
    },
    fcmToken: String,
    hoardings: [{ type: String, ref: "hoarding" }],
    verified: {
      type: Boolean,
      default: false,
    },
    verification: {
      createdAt: {
        type: String,
        select: false,
      },
      otp: {
        type: String,
        select: false,
      },
    },
    favoriteHoardings: [{ type: mongoose.Schema.Types.ObjectId, default: [] }],
    two_factorAuth: {
      type: Boolean,
      default: false,
    },
    resetPassword: {
      createdAt: {
        type: String,
        select: false,
      },
      otp: { type: String, select: false },
    },
    profileUrl: String,
    activePlan: {
      plan: String,
      planId: { type: mongoose.Types.ObjectId, ref: "billings" },
    },
    twoStepVerification: {
      type: Boolean,
      default: false,
    },
    emailSetup: {
      type: Boolean,
      default: false,
    },
    smsSetup: {
      type: Boolean,
      default: false,
    },
    billings: {
      invoices: [String],
      taxinfo: [String],
    },
    location: {
      address: String,
      geoLocation: {
        type: {
          type: String,
        },
        coordinates: {
          type: [Number],
        },
      },
    },
    countryCode: {
      type: String,
    },
    recentlyViewed: {
      type: [mongoose.Schema.Types.ObjectId],
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.index({ email: 1, phNumber: 1 });

const userModel = mongoose.model<userType>("user", userSchema);
export default userModel;
