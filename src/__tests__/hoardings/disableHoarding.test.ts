import hoardingModel from "../../Models/hoardingModel";
import { deletUserById, generateJwtToken } from "../../Libray/userLibrary";
import userModel, { userType } from "../../Models/userModel";
import { generateOwner, generateAdmin } from "../../helpers/testUser";
import { generateHoardings } from "../../helpers/testHoardings";
import request from "supertest";
import { createHoarding } from "../../Libray/hoardingLibrary";
import app from "../../app";
import { getHoarding } from "../../Controllers/hoardingControllers";
import testDb from "../../Config/testDb";

const adminDetails = {
  fullName: "vamshiOwner",
  email: "vamshiAdmin@gmail.com",
  phNumber: "98798403",
};

const ownerDetails = {
  fullName: "vamshiOwner",
  email: "vamshiOwner@gmail.com",
  phNumber: "98798403",
};
const ownerDetails2 = {
  fullName: "testOwner2",
  email: "testOwner@gmail.com",
  phNumber: "98798403",
};

describe("testing disable haording route", () => {
  let owner: userType;
  let owner2: userType;
  let admin: userType;
  let adminToken: string;
  let ownerToken: string;
  const db = new testDb();
  beforeAll(async () => {
    await db.connect();
    const data = await generateAdmin(adminDetails);
    const data2 = await generateOwner(ownerDetails);
    const data3 = await generateOwner(ownerDetails2);

    if (data && data2 && data3) {
      adminToken = generateJwtToken({
        email: data?.email,
        _id: data?._id,
      });
      ownerToken = generateJwtToken({
        email: data2?.email,
        _id: data2?._id,
      });
      admin = data;
      owner = data2;
      owner2 = data3;
    }
  });
  afterAll(async () => {
    let prmArr: any = [];

    prmArr.push(userModel.deleteOne({ _id: admin._id }));
    prmArr.push(userModel.deleteOne({ _id: owner._id }));

    await Promise.all(prmArr);
    await db.disconnect();
  });

  describe("testing getHoardingby owner route functinality ", () => {
    it("should return error if we send invalid object id in the params", async () => {
      const response = await makeCall(adminToken, "38r39");
      const responseData = response.body;

      expect(responseData).toEqual(expect.any(Array));
      expect(responseData.length).toBe(1);
      expect(responseData[0]).toHaveProperty("message");
      expect(responseData[0].message).toBe(
        "hoardingId is not a valid objectId"
      );
    });
    it("should return error if we send invalid object id in the params", async () => {
      const hoarding = await hoardingModel.create({
        name: "hoarding14",
        owner: owner._id?.toString(),
        location: {
          geoLocation: {
            type: "Point",
            coordinates: [27.39, 72.8],
          },
        },
      });
      const response = await makeCall(adminToken, hoarding._id);
      const responseData = response.body;
      expect(response.status).toBe(200);
      expect(responseData).toHaveProperty("message");
      expect(responseData.message).toBe("hoarding disabled successfully");
      const hoardingDoc = await userModel.findOne({ _id: hoarding._id });
      expect(hoardingDoc).toBeDefined();
    });
    it("should check wheter the owner has access to disable the hoarding", async () => {
      const hoarding = await hoardingModel.create({
        name: "hoarding14",
        owner: owner2._id?.toString(),
        location: {
          geoLocation: {
            type: "Point",
            coordinates: [27.39, 72.8],
          },
        },
      });
      const response = await makeCall(ownerToken, hoarding._id);
      const responseData = response.body;

      expect(response.status).toBe(401);
      expect(responseData).toHaveProperty("message");
      expect(responseData.message).toBe(
        "you do not have permission to change this resource"
      );
    });
  });
});

async function makeCall(token: string, hoardinId: string | undefined) {
  const URL = `/api/hoarding/disableHoarding/${hoardinId}`;

  const response = await request(app).put(URL).set("authorization", token);

  return response;
}
