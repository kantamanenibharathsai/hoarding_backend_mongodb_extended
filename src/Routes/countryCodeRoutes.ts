import { Router } from "express";
import {
  addCountryCode,
  deleteCountryCode,
  updateContryCode,
  getCountryList,
  getCountryByQuery,
} from "../Controllers/countryControllers";
import { verifyRoleAccess } from "../Middlewares/verifyRoleAccess";
import { ADMIN } from "../helpers/constants";
const route = Router();

route.get("/", getCountryList);

route.post("/", verifyRoleAccess([ADMIN]), addCountryCode);
route.delete("/:id", verifyRoleAccess([ADMIN]), deleteCountryCode);
route.put("/:id", verifyRoleAccess([ADMIN]), updateContryCode);
route.get("/search", getCountryByQuery);
export default route;
