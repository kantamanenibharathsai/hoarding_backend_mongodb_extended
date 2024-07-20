import { Router } from "express";
import {
  getAllFavorites,
  removeFavorite,
  addFavorite,
} from "../Controllers/favoritesController";

const route = Router();

route.get("/", getAllFavorites);

route.post("/", addFavorite);
route.delete("/:id", removeFavorite);

export default route;
