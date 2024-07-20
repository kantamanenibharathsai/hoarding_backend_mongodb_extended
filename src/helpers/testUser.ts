import userModel from "../Models/userModel";
import { ADMIN, CUSTOMER, OWNER, SALES } from "./constants";
export async function generateCustomer({
  fullName,
  email,
  phNumber,
}: {
  fullName: string;
  email: string;
  phNumber: string;
}) {
  try {
    const userDetails = {
      fullName,
      email,
      phNumber,
      role: CUSTOMER,
      verified: true,
    };
    const user = await userModel.create(userDetails);
    if (user) {
      return Promise.resolve(user);
    }
  } catch (err) {
    console.log(err);
  }
}

export async function generateOwner({
  fullName,
  email,
  phNumber,
}: {
  fullName: string;
  email: string;
  phNumber: string;
}) {
  try {
    const userDetails = {
      fullName,
      email,
      phNumber,
      role: OWNER,
      verified: true,
    };
    const user = await userModel.create(userDetails);
    return Promise.resolve(user);
  } catch (err) {
    console.log(err);
  }
}

export async function generateAdmin({
  fullName,
  email,
  phNumber,
}: {
  fullName: string;
  email: string;
  phNumber: string;
}) {
  try {
    const userDetails = {
      fullName,
      email,
      phNumber,
      role: ADMIN,
      verified: true,
    };
    const user = await userModel.create(userDetails);
    return Promise.resolve(user);
  } catch (err) {
    console.log(err);
  }
}
export async function generateSales({
  fullName,
  email,
  phNumber,
}: {
  fullName: string;
  email: string;
  phNumber: string;
}) {
  const userDetails = {
    fullName,
    email,
    phNumber,
    role: SALES,
    verified: true,
  };
  const user = await userModel.create(userDetails);
  return Promise.resolve(user);
}
