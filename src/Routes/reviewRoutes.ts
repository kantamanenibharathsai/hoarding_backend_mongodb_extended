import { Router } from "express";
import {
  getReviewDetails,
  addReview,
  deleteReview,
  updateReview,
} from "../Controllers/reviewController";
const route = Router();

route.post("/", addReview);
route.get("/", getReviewDetails);
route.put("/", updateReview);
route.delete("/", deleteReview);

export default route;
