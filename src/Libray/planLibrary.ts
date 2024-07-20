import planModel, { planT } from "../Models/planModel";

export async function getPlanById(planId: string) {
  try {
    const plan = await planModel.findOne({ _id: planId });
    return Promise.resolve(plan);
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function getPlan(query: object) {
  try {
    const plan = await planModel.findOne(query);
    return Promise.resolve(plan);
  } catch (err) {
    return Promise.reject(err);
  }
}
type planProjection = {
  [k in keyof planT]: boolean | number;
};
export async function getPlansByCondition(
  query: object,
  projection: Partial<planProjection> = {}
) {
  try {
    const plans = await planModel.find(query, projection);
    return Promise.resolve(plans);
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function deletePlanById(planId: string) {
  try {
    await planModel.deleteOne({ _id: planId });
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function createPlan(objCreate: planT) {
  try {
    const plan = await planModel.create(objCreate);
    return Promise.resolve(plan);
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function updatePlanByCondition(query: object, objUpdate: object) {
  try {
    await planModel.updateOne(query, objUpdate);
    return Promise.resolve({ message: "updated plan successfully" });
  } catch (err) {
    return Promise.reject(err);
  }
}
