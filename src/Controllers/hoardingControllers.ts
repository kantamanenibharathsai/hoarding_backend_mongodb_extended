import { Request, Response } from "express";
import { getUserById, updateUser } from "../Libray/userLibrary";
import {
  getHoardingById,
  deleteHoarding,
  getHoardingsByCondition,
  updateHoardingById,
} from "../Libray/hoardingLibrary";
import reviewModel from "../Models/reviewModel";
import { uploadfiles } from "../helpers/cloudinaryUtils";
import mongoose, {
  MongooseError,
  PipelineStage,
  SortOrder,
  Error,
} from "mongoose";
import hoardingModel from "../Models/hoardingModel";
import { hoardingDetails } from "./dashboardController";
import { ADMIN, CUSTOMER, SALES } from "../helpers/constants";

export async function addHoarding(req: Request, res: Response) {
  try {
    const {
      name,
      address,
      category,
      height,
      width,
      licenseNumber,
      complience,
      price,
      billingInfo,
      features,
      productVariant,
      latitude,
      longitude,
      hoardingOwner,
    } = req.body;

    const user = req.user;

    let owner: string = hoardingOwner;

    if ((user.role === "ADMIN" || user.role === "SALES") && !hoardingOwner) {
      return res
        .status(400)
        .json({ message: "hoarding owner field cannot be empty" });
    }
    const hoardOwner = await getUserById(hoardingOwner);
    if (user.role !== "OWNER" && !hoardOwner) {
      return res
        .status(400)
        .json({ message: "Provided hoarding owner not found" });
    }
    if (user.role === "OWNER") {
      owner = user.id;
    }

    let imageUrls: string[] = [];
    if (req.files) {
      try {
        imageUrls = Array.isArray(req.files)
          ? await uploadfiles(req.files)
          : [];
      } catch (err) {
        console.log(err);
      }
    }

    const objCreate = {
      name,
      location: {
        address,
        geoLocation: {
          type: "Point",
          coordinates: [Number(longitude), Number(latitude)],
        },
      },
      category,
      dimension: { height, width },
      permissions: { licenseNumber, complience },
      costPerDay: price,
      billingInfo,
      features,
      productVariant,
      owner,
      images: imageUrls,
    };

    const hoarding = new hoardingModel(objCreate);

    const userObjUpdate = {
      $push: {
        hoardings: hoarding._id,
      },
    };
    await hoarding.save();
    await updateUser({ _id: owner }, userObjUpdate);

    return res
      .status(201)
      .json({ message: "hoarding created successfully", data: hoarding });
  } catch (err) {
    return res.status(500).json(err);
  }
}

export async function getHoarding(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const hoarding = await getHoardingById(id);
    if (!hoarding) {
      return res
        .status(404)
        .json({ message: "hoarding is not found with corresponding id" });
    }
    const aggregateArr = [
      { $match: { hoardingId: hoarding.id } },
      { $group: { _id: null, avgRatings: { $avg: "$ratings" } } },
      { $project: { _id: false } },
    ];
    const [reviewCount] = await reviewModel.aggregate(aggregateArr);

    return res.json({ data: { hoarding, avgRatings: reviewCount } });
  } catch (err) {
    return res.status(500).json(err);
  }
}

export async function removeHoarding(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = req.user;

    const hoarding = await getHoardingById(id);
    if (!hoarding) {
      return res
        .status(400)
        .json({ message: "hoarding not found with corresponding id" });
    }
    if (user.role === "OWNER") {
      if (user.id.toString() !== hoarding?.owner)
        return res.status(403).json({
          message:
            "you cannot delete this hoarding as you are not the owener of this hoarding",
        });
    }
    const deleteData = await deleteHoarding({ _id: id });
    return res.status(200).json({ message: "hoarding deleted successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
}

export async function getHoardingsByOwner(req: Request, res: Response) {
  try {
    const { ownerId } = req.params;
    const owner = await getUserById(ownerId);
    if (!owner) {
      return res
        .status(400)
        .json({ message: "owner is not found with corresponding id" });
    }
    const hoardings = await getHoardingsByCondition({ owner: ownerId });
    return res.json({ data: hoardings });
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function disableHoarding(req: Request, res: Response) {
  try {
    const { hoardingId } = req.params;
    const { startDate, endDate } = req.body;
    const user = req.user;
    const hoarding = await getHoardingById(hoardingId, { owner: true });
    if (user.role === "OWNER" && hoarding?.owner !== user.id) {
      return res.status(401).json({
        message: "you do not have permission to change this resource",
      });
    }
    await updateHoardingById(hoardingId, {
      status: false,
      disabledDate: { startDate, endDate },
    });
    return res.json({ message: "hoarding disabled successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
}

export async function enableHoarding(req: Request, res: Response) {
  try {
    const { hoardingId } = req.params;
    const user = req.user;
    const prmArr = [];
    prmArr.push();

    let hoarding = await getHoardingById(hoardingId, {
      owner: true,
      status: true,
      disabledDate: true,
    });
    if (!hoarding)
      return res.status(404).json({ message: "hoarding not found" });

    if (user.role === "OWNER" && hoarding.owner !== user.id) {
      return res
        .status(401)
        .json({ message: "you do not have access to change this hoarding" });
    }
    await updateHoardingById(hoardingId, { status: true, disabledDate: {} });
    return res.json({ message: "enabled hoarding successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
}

export async function getMyHoardings(req: Request, res: Response) {
  try {
    const { page, limit } = req.query;
    const user = req.user;

    const hoardings = await getHoardingsByCondition(
      { owner: user.id },
      {},
      limit ? Number(limit) : undefined,
      page ? Number(page) : undefined,
      { createdAt: 1 }
    );
    return res.status(200).json({ data: hoardings });
  } catch (err) {
    return res.status(500).json(err);
  }
}

export async function addRecentlyViewed(req: Request, res: Response) {
  try {
    const { hoardingId } = req.params;
    const user = req.user;
    const userDoc = await getUserById(user.id, { recentlyViewed: 1 });
    const recents = userDoc?.recentlyViewed;
    if (recents && recents?.length < 10) {
      const objUpdate = {
        $push: {
          recentlyViewed: {
            $each: [hoardingId],
            $position: 0,
          },
        },
      };
      await userDoc.updateOne(objUpdate);
    } else {
      let objUpdate: any = {
        $pop: {
          recentlyViewed: 1,
        },
      };
      await userDoc?.updateOne(objUpdate);

      objUpdate = {
        $push: {
          recentlyViewed: {
            $each: [hoardingId],
            $position: 0,
          },
        },
      };
      await userDoc?.updateOne(objUpdate);
    }
    return res.json({ message: "recents updated" });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function getRecentHoardings(req: Request, res: Response) {
  try {
    const user = req.user;
    const userDoc = await getUserById(user.id, { recentlyViewed: 1 });
    const recents = userDoc?.recentlyViewed;
    return res.json({ data: recents });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function topHoardings(req: Request, res: Response) {
  try {
    // get the hoardings by area within 50 km
    // top criteria for now is ratings should be high
    // group them using hoardings  and find the average ratings for
    // each hoardings
    // sort them in descending order
    // now limit based on the parameters
    // page also

    const user = req.user;
    const { lat, long } = req.query;
    const maxDistance = req.query.distance
      ? Number(req.query.distance)
      : 1000 * 50;
    const userdoc = await getUserById(user.id);
    if (!userdoc) throw new Error("user not found");

    // change location to variables
    let coordinates = [78.450366, 17.363352];
    if (lat && long) coordinates = [Number(long), Number(lat)];

    const nearHoardings = await hoardingModel.find({
      "location.geoLocation": {
        $near: {
          $geometry: { type: "Point", coordinates: coordinates },
          $maxDistance: 5000,
        },
      },
    });

    const hoardingsIds: string[] = nearHoardings.map((item) => {
      return item._id.toString();
    });

    // get all the hoardings
    // group them by hoardirng ids
    // calucatlate the avearage ratings
    // sort them on the basis of average ratings

    const aggregate: PipelineStage[] = [
      {
        $match: {
          hoardingId: { $in: hoardingsIds },
        },
      },
      {
        $group: {
          _id: "$hoardingId",
          averageRatings: { $avg: "$ratings" },
        },
      },
      {
        $sort: {
          averageRatings: -1,
        },
      },
    ];

    const reviews = await reviewModel.aggregate(aggregate);

    const combinedReviewsHoardings = nearHoardings.map((hoarding) => {
      const review = reviews.find((item) => item.hoardingId === hoarding._id);
      const averageRatings =
        review !== undefined
          ? review.avearageRatings !== undefined
            ? review.averageRatings
            : 0
          : 0;
      const hoardObj = hoarding.toObject();
      return { ...hoardObj, averageRatings };
    });

    return res.json({ data: combinedReviewsHoardings });
  } catch (err: any) {
    return res.status(500).json({ err });
  }
}

export async function deleteImages(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;
    const user = req.user;
    const hoarding = await getHoardingById(id);
    if (!hoarding)
      return res.status(400).json({ message: "hoarding not found" });
    if (
      hoarding.owner !== user.id &&
      user.role !== ADMIN &&
      user.role !== SALES
    )
      return res
        .status(401)
        .json({ message: "you do not have pemission to remove the image" });

    const objUpdate = {
      $pull: {
        images: imageUrl,
      },
    };
    await hoarding.updateOne(objUpdate);
    const updatedHoarding = await getHoardingById(id);
    return res.json({ message: "removed the image", data: updatedHoarding });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export async function searchHoardings(req: Request, res: Response) {
  try {
    const {
      startDate,
      endDate,
      lat,
      long,
      radius = 5000,
      minPrice,
      maxPrice,
      minRating,
      maxRating,
      city,
      hoardingName,
      page,
      pageSize,
      sortBy,
      sortDir,
    } = req.query;
    let objQuery: any = {};
    if (lat && long) {
      objQuery["location.geoLocation"] = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(long), Number(lat)],
          },
          $maxDistance: Number(radius),
        },
      };
    }
    if (minPrice && maxPrice) {
      objQuery = {
        $and: [
          { costPerDay: { $gt: Number(minPrice) } },
          { costPerDay: { $lte: Number(maxPrice) } },
        ],
      };
    } else {
      if (minPrice) {
        objQuery["costPerDay"] = {
          $gte: Number(minPrice),
        };
      } else if (maxPrice) {
        objQuery["costPerDay"] = {
          $lte: Number(maxPrice),
        };
      }
    }
    if (city) {
      objQuery["city"] = {
        $regex: city,
        $options: "si",
      };
    }
    if (hoardingName) {
      objQuery["name"] = {
        $regex: hoardingName,
        $options: "si",
      };
    }
    const limit = pageSize !== undefined ? Number(pageSize) : 10;
    const skip = page !== undefined ? Number(page) : 1;
    let sortDirection: 1 | -1 = 1;
    if (sortDir === "Desc") sortDirection = -1;
    let sortByQuery: string = "createdAt";
    if (sortBy) {
      sortByQuery = sortBy as string;
    }
    let sortObj: { [key: string]: SortOrder } = {};
    sortObj[sortByQuery] = sortDirection;
    const hoardings = await getHoardingsByCondition(
      objQuery,
      {},
      limit,
      skip,
      sortObj
    );

    return res.json({ data: hoardings });
  } catch (err) {
    return res.status(500).json({ err });
  }
}
