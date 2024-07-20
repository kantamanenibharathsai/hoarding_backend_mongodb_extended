import hoardingModel, { hoardingType } from "../../Models/hoardingModel";
import {
  getHoardingsByCondition,
  updateHoardingsByCondtion,
} from "../../Libray/hoardingLibrary";
import mongoose, { Query, UpdateWriteOpResult, Document } from "mongoose";

export async function enableHoardingHandler() {
  try {
    const currentDay = new Date();

    const data = await getHoardingsByCondition(
      {
        status: false,
        "disabledDate.endDate": { $lte: currentDay },
      },
      { status: 1, disabledDate: 1, owner: 1 }
    );

    const documentIds = data.map((hoarding) => {
      return hoarding._id;
    });
    if (documentIds.length === 0) {
      console.log("no document to enable");
      return;
    }
    await updateHoardingsByCondtion(
      { _id: { $in: documentIds } },
      { status: true, disabledDate: {} }
    );
    console.log("updating hoardings completed");
  } catch (err) {
    console.log(err);
  }
}

// add the booking history
export async function removeBookedHoardings() {
  try {
    // get the hoardings which are currently booked
    const query = { "datesBooked.0": { $exists: true } };
    const hoardings = await getHoardingsByCondition(query);
    if (hoardings.length === 0) {
      console.log("no hoardings are booked now");
      return;
    }

    type hoardingUpdatePromise = Query<
      UpdateWriteOpResult,
      Document<unknown, {}, hoardingType> &
        hoardingType &
        Required<{
          _id: string;
        }>,
      {},
      hoardingType,
      "updateOne"
    >;
    const updatePromises = hoardings.reduce(
      (prev: hoardingUpdatePromise[], hoarding) => {
        let promises: hoardingUpdatePromise[] = [];
        hoarding.datesBooked.forEach((dateObj, idx) => {
          if (dateObj.endDate < new Date()) {
            promises.push(
              hoardingModel.updateOne({ _id: hoarding._id }, [
                {
                  $set: {
                    datesBooked: {
                      $concatArrays: [
                        { $slice: ["$datesBooked", idx] },
                        {
                          $slice: [
                            "$datesBooked",
                            { $add: [1, idx] },
                            { $size: "$datesBooked" },
                          ],
                        },
                      ],
                    },
                  },
                },
              ])
            );
          }
        });
        return prev.concat(promises);
      },
      []
    );

    const data = await Promise.all(updatePromises);
  } catch (err) {
    console.log("error happened when running remove booked hoardings cron", {
      err,
    });
  }
}

const prm = hoardingModel.updateOne({ _id: "1" }, { name: "vamshi" });

async function dothis() {
  await prm;
}
