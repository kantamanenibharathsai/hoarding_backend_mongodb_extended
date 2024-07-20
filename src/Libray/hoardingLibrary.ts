import hoardingModel from "../Models/hoardingModel";
import { hoardingType } from "../Models/hoardingModel";
import { Document, SortOrder } from "mongoose";

export async function createHoarding(data: Partial<hoardingType>) {
  try {
    const hoardingDoc = await hoardingModel.create(data);
    return Promise.resolve(hoardingDoc);
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function deleteHoarding(query: Partial<hoardingType>) {
  try {
    const data = await hoardingModel.deleteOne(query);
    console.log(data);

    return Promise.resolve(data);
  } catch (err) {
    return Promise.reject(err);
  }
}

type hoardingProjection = {
  [k in keyof hoardingType]?: boolean | number;
};

export type hoardigDoc = Document & hoardingType;
export async function getHoardingById(
  id: string,
  projection: hoardingProjection = {}
): Promise<hoardigDoc | null> {
  const hoarding: (Document & hoardingType) | null =
    await hoardingModel.findById(id, projection);

  return Promise.resolve(hoarding);
}

export async function updateHoardingById(
  id: string,
  objUpdate: Partial<hoardingType>
) {
  try {
    await hoardingModel.updateOne({ _id: id }, objUpdate, { upsert: true });
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function getHoardingsByCondition(
  query: object,
  projection: hoardingProjection = {},
  limit: number = 10,
  page: number = 1,
  sort: { [key: string]: SortOrder } = {}
): Promise<hoardigDoc[]> {
  try {
    const hoardings = await hoardingModel
      .find(query)
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);

    return Promise.resolve(hoardings);
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function updateHoardingsByCondtion(
  query: object,
  objUpdate: Partial<hoardingType>
) {
  try {
    if (!query || !objUpdate) {
      return Promise.reject("please provide the query or data to update");
    }
    const updateData = await hoardingModel.updateMany(query, objUpdate);
    return Promise.resolve(updateData);
  } catch (err) {
    return Promise.reject(err);
  }
}
