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

describe("testing remove hoarding route", () => {
  let owner: userType;
  let admin: userType;
  let adminToken: string;
  const db = new testDb();
  beforeAll(async () => {
    await db.connect();
    const data = await generateAdmin(adminDetails);
    const data2 = await generateOwner(ownerDetails);
    if (data && data2) {
      adminToken = generateJwtToken({
        email: data?.email,
        _id: data?._id,
      });
      admin = data;
      owner = data2;
    }
    let prmArr: any = [];
    for (let i = 0; i < 20; i++) {
      let data = {
        name: `hoarding${i}`,
        owner: owner._id?.toString(),
        location: {
          address: "",
          geoLocation: {
            type: "Point",
            coordinates: [75, 17],
          },
        },
      };
      prmArr.push(createHoarding(data));
    }
    await Promise.all(prmArr);
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
      expect(responseData[0].message).toBe("objectId is not a valid id");
    });
    it("should return all the owner hoardings", async () => {
      let objId = owner._id?.toString();
      const response = await makeCall(adminToken, objId);
      const responseData = response.body;
      expect(responseData).toHaveProperty("data");

      expect(responseData.data).toEqual(expect.any(Array));
      expect(responseData.data.length).toBe(10);
      const doc = responseData.data[0];
      const hoardingDoc = await hoardingModel.findOne({ _id: doc._id });
      expect(hoardingDoc).toBeDefined();
    });
    it("should return error if owner is not present in the database", async () => {
      let objId = "507f1f77bcf86cd799439011";
      const response = await makeCall(adminToken, objId);
      const responseData = response.body;
      expect(response.status).toBe(400);
      expect(responseData).toHaveProperty("message");
      expect(responseData.message).toBe(
        "owner is not found with corresponding id"
      );
    });
  });
});

async function makeCall(token: string, ownerId: string | undefined) {
  const URL = `/api/hoarding/getHoardingByOwner/${ownerId}`;

  const response = await request(app).get(URL).set("authorization", token);

  return response;
}
