import sideBarModel from "../Models/sidebarModel";

export async function getSideBarByCondition(query: object) {
  try {
    const sidebar = await sideBarModel.findOne(query).populate("sideMenu.id");
    return Promise.resolve(sidebar);
  } catch (err) {
    return Promise.reject(err);
  }
}
