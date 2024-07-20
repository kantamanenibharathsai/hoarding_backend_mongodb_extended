import reviewModel from "../Models/reviewModel";
import { Request, Response } from "express";
import { reviewSchemaType } from "../Models/reviewModel";
import { getHoarding } from "./hoardingControllers";
import { getHoardingById } from "../Libray/hoardingLibrary";
import mongoose from "mongoose";
import { ADMIN } from "../helpers/constants";

export async function addReview(req: Request, res: Response) {
  try {
    let { rating, review, hoardingId } = req.body;
    rating = rating > 5 ? 5 : rating;
    const user = req.user;
    const hoarding = await getHoardingById(hoardingId);
    if (!hoarding) {
      return res.status(400).json({ message: "haording not found" });
    }
    const objCreate: Partial<reviewSchemaType> = {
      review: review,
      ratings: rating,
      status: true,
      hoardingId,
      reviewerId: user.id as unknown as mongoose.Types.ObjectId,
    };
    const reviewDoc = await reviewModel.create(objCreate);
    return res.json({ message: "review added ", data: reviewDoc });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function deleteReview(req: Request, res: Response) {
  try {
    const reviewId = req.params;
    const reviewDoc = await reviewModel.findOne({ _id: reviewId });
    const user = req.user;
    if (user.id !== reviewDoc?.reviewerId.toString() && user.role !== ADMIN) {
      return res.status(400).json({
        message: "you do not have permission to delete this docuement",
      });
    }
    await reviewModel.deleteOne({ _id: reviewId });
    return res.status(400).json({ message: "deleted review successfully" });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function updateReview(req: Request, res: Response) {
  try {
    const { reviewId } = req.params;
    const { status, rating, review } = req.body;
    const reviewDoc = await reviewModel.findOne({ _id: reviewId });
    const user = req.user;
    if (user.id !== reviewDoc?.reviewerId.toString() && user.role !== ADMIN) {
      return res.status(400).json({
        message: "you do not have permission to update this content",
      });
    }
    const objUpdate: Partial<reviewSchemaType> = {};
    if (status) objUpdate["status"] = status;
    if (rating !== undefined && typeof rating === "number")
      objUpdate["ratings"] = rating > 5 ? 5 : rating;
    if (review) objUpdate["review"] = objUpdate["review"] = review;

    await reviewModel.updateOne({ _id: reviewId }, objUpdate);
    const updatedReviewDoc = await reviewModel.findOne({ _id: reviewId });
    return res.json({
      message: "review updated successfully",
      data: updatedReviewDoc,
    });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function getReviewDetails(req: Request, res: Response) {
  try {
    const { reviewId } = req.params;
    const reviewDoc = await reviewModel.findOne({ _id: reviewId });
    if (!reviewDoc)
      return res
        .status(400)
        .json({
          message: "review document not found with corresponding reviewId",
        });
    return res.json({ data: reviewDoc });
  } catch (err) {
    return res.status(500).json({ err });
  }
}
