import mongoose, { Types, Schema } from "mongoose";
import { getMyHoardings } from "../Controllers/hoardingControllers";

type userNotification = {
  id: mongoose.Types.ObjectId | string;
  status: boolean;
};

export type userPrefType = {
  userId: string;
  notifications: Map<string, userNotification>;
  selectedLanguage: {
    name: string;
    id: string;
  };
};

const userPrefSchema = new Schema<userPrefType>(
  {
    userId: {
      type: String,
      ref: "user",
      required: true,
    },
    notifications: {
      type: Map,
      of: {
        id: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "notificationTypes",
        },
        status: { type: Boolean, required: true },
      },
    },
    selectedLanguage: {
      name: {
        type: String,
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "language",
      },
    },
  },
  { versionKey: false, timestamps: true }
);

const userPreferenceModal = mongoose.model<userPrefType>(
  "userPreferences",
  userPrefSchema
);
export default userPreferenceModal;
