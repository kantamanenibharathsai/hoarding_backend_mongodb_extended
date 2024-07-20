import userModel, { userType } from "../Models/userModel";
import { Document, SortOrder, Types, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import { promiseHooks } from "v8";
import userPreferenceModal, { userPrefType } from "../Models/userPreferences";
import termsModel from "../Models/termsModel";
import languageModel from "../Models/languageModel";
import { userChatModel } from "../Models/messaging";
type userTypeProjection = {
  [k in keyof userType]: boolean | number;
};

export type userDoc = Document & userType;

export async function getUserById(
  userId: string | Schema.Types.ObjectId,
  projection: Partial<userTypeProjection> = {}
): Promise<userDoc | undefined | null> {
  const userProjection = {
    ...projection,
  };
  const userDoc: userDoc | undefined | null = await userModel.findOne(
    {
      _id: userId,
    },
    userProjection
  );
  return Promise.resolve(userDoc);
}

export async function getUsersByCondition(
  query: object,
  projection: Partial<userTypeProjection> = {},
  sortBy: { [key: string]: SortOrder } = {},
  page: number = 1,
  limit: number = 10
) {
  try {
    const userData = await userModel
      .find(query, projection)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit);
    return Promise.resolve(userData);
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function getUserByCondition(
  query: object,
  projection: Partial<userTypeProjection> = {}
) {
  try {
    const userData = await userModel.findOne(query, projection);
    return Promise.resolve(userData);
  } catch (err) {
    return Promise.reject(err);
  }
}

type generateJwtTokenParams = {
  _id: string;
  email: string;
};
export function generateJwtToken(payload: generateJwtTokenParams) {
  const SECRETKEY = process.env.JWTSECRETKEY ? process.env.JWTSECRETKEY : "";
  const token = jwt.sign(payload, SECRETKEY);
  return token;
}

export async function updateUser(searchQuery: object, objUpdate: object) {
  try {
    const userDoc = await userModel.updateOne(searchQuery, objUpdate);
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function createUser(objCreate: Partial<userType>) {
  try {
    const user = await userModel.create(objCreate);
    return Promise.resolve(user);
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function deletUserById(userId: string | undefined) {
  try {
    if (userId) {
      await userModel.deleteOne({ _id: userId });
      return Promise.resolve();
    }
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function getUserPreferences(
  userId: string | Schema.Types.ObjectId
) {
  try {
    const userPref = await userPreferenceModal.findOne({ userId: userId });
    return Promise.resolve(userPref);
  } catch (err) {
    return Promise.reject({ err });
  }
}

export async function addDefaultuserPreferences(
  userId: string | Schema.Types.ObjectId
) {
  try {
    const userPrm = userModel.findOne({ _id: userId });
    const userPrefprm = userPreferenceModal.findOne({ userId: userId });
    // default language is english
    const languagePrm = languageModel.findOne({ name: "English" });
    const [userDoc, userPreferences, language] = await Promise.all([
      userPrm,
      userPrefprm,
      languagePrm,
    ]);
    if (userPreferences !== null) {
      return Promise.resolve(userPreferences);
    }
    if (language && userDoc) {
      const objCreate: Partial<userPrefType> = {
        userId: userDoc._id,
        selectedLanguage: {
          name: language.name,
          id: language._id.toString(),
        },
        notifications: new Map(),
      };
      return Promise.resolve(await userPreferenceModal.create(objCreate));
    } else {
      throw new Error("internal server error");
    }
  } catch (err) {
    console.log("failed to create a userpreferences");
    return Promise.reject(err);
  }
}

export async function addUserChat(userId: string, name: string) {
  try {
    await userChatModel.create({ userid: userId, chats: [], username: name });
  } catch (err) {
    console.log(err);
  }
}
