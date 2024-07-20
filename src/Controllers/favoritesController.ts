import { Request, Response } from "express";
import { getUserById, updateUser } from "../Libray/userLibrary";

export async function addFavorite(req: Request, res: Response) {
  try {
    const { hoardingId } = req.body;
    const user = req.user;
    const userDoc = await getUserById(user.id, { favoriteHoardings: 1 });
    const isFavouriteExists = userDoc?.favoriteHoardings.includes(hoardingId);
    if (isFavouriteExists)
      return res.json({ message: "favourite already exists" });
    const objUpdate = {
      $push: {
        favoriteHoardings: hoardingId,
      },
    };
    await updateUser({ _id: user.id }, objUpdate);
    const updatedUser = await getUserById(user.id, { favoriteHoardings: 1 });
    return res.json({
      message: "favorite is added",
      data: updatedUser?.favoriteHoardings,
    });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function removeFavorite(req: Request, res: Response) {
  try {
    const { hoardingId } = req.body;
    const user = req.user;
    const userDoc = await getUserById(user.id, { favoriteHoardings: 1 });
    const isFavouriteExists = userDoc?.favoriteHoardings.includes(hoardingId);
    if (!isFavouriteExists)
      return res.json({ message: "favourite doesn't exists" });
    const objUpdate = {
      $pull: {
        favoriteHoardings: hoardingId,
      },
    };
    await updateUser({ _id: user.id }, objUpdate);
    return res.json({ message: "favorite is removed" });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function getAllFavorites(req: Request, res: Response) {
  try {
    const user = req.user;
    const userDoc = await getUserById(user.id, { favoriteHoardings: 1 });

    return res.json({ data: userDoc?.favoriteHoardings });
  } catch (err) {
    return res.status(500).json({ err });
  }
}
