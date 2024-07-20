import planModel from "../../Models/planModel";
import { deletUserById, generateJwtToken } from "../../Libray/userLibrary";
import userModel, { userType } from "../../Models/userModel";
import {
  generateAdmin,
  generateCustomer,
  generateOwner,
  generateSales,
} from "../../helpers/testUser";
import request from "supertest";
import app from "../../app";
import testDb from "../../Config/testDb";

const adminDetails = {
  fullName: "vamshiAdmin",
  email: "vamshiAdmin@gmail.com",
  phNumber: "987984037",
};

describe("testing addplan route", () => {
  let admin: userType;

  let adminToken: string;
  const db = new testDb();
  beforeAll(async () => {
    await db.connect();
    const prmArr = [generateAdmin(adminDetails)];
    const data = await Promise.all(prmArr);

    if (data[0]) {
      admin = data[0];

      adminToken = generateJwtToken({
        email: data[0]?.email,
        _id: data[0]?._id,
      });
    }
  });

  afterAll(async () => {
    const prmArr = [deletUserById(admin._id)];
    await Promise.all(prmArr);
    jest.clearAllMocks();
    await db.disconnect();
  });

  describe("testing the functionality of the add plan route", () => {
    it("should return empty array as we do not have any plans", async () => {
      const response = await makeCall(adminToken);
      const responseData = response.body;

      expect(responseData.data).toEqual(expect.any(Array));
      expect(responseData.data.length).toBe(0);
    });
    it("should return all the plans ", async () => {
      const plan1 = {
        duration: "3 monts",
        pricePerMonth: 393,
        planName: "gold",
        hoardingLimit: 53,
        status: true,
      };
      const plan2 = {
        duration: "3monts",
        pricePerMonth: 393,
        planName: "premium",
        hoardingLimit: 53,
        status: true,
      };
      const plan3 = {
        duration: "3monts",
        pricePerMonth: 393,
        planName: "silver",
        hoardingLimit: 53,
        status: true,
      };
      const arr = [plan1, plan2, plan3];
      const data = await planModel.insertMany(arr);
      const response = await makeCall(adminToken);
      const responseData = response.body;

      expect(responseData.data).toEqual(expect.any(Array));
      expect(responseData.data.length).toBe(3);
      const resData = responseData.data;
      expect(resData[0].planName).toEqual(plan1.planName);
      expect(resData[1].planName).toEqual(plan2.planName);
      expect(resData[2].planName).toEqual(plan3.planName);
      resData.forEach(async (item: any) => {
        await planModel.deleteOne({ _id: item._id });
      });
    });
  });
});

async function makeCall(token: string) {
  const URL = "/api/plans";
  const response = await request(app).get(URL).set("authorization", token);

  return response;
}
