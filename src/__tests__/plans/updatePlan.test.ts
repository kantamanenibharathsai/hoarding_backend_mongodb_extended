import planModel from "../../Models/planModel";
import { deletUserById, generateJwtToken } from "../../Libray/userLibrary";
import userModel, { userType } from "../../Models/userModel";
import { generateAdmin } from "../../helpers/testUser";
import request from "supertest";
import app from "../../app";
import testDb from "../../Config/testDb";

const adminDetails = {
  fullName: "vamshiAdmin",
  email: "vamshiAdmin@gmail.com",
  phNumber: "987984037",
};

describe("testing update plan route", () => {
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

  describe("testing the functionality of update route", () => {
    it("should return error if planId is not a valid id ", async () => {
      const response = await makeCall("token", adminToken, {});
      const responseData = response.body;
      expect(responseData).toEqual(expect.any(Array));
      expect(responseData.length).toBe(1);
      expect(responseData[0]).toEqual({
        message: "planId is not a valid object Id",
      });
    });
    it(" should update the specified fields", async () => {
      const plan1 = {
        duration: "3 monts",
        pricePerMonth: 393,
        planName: "gold",
        hoardingLimit: 53,
        status: true,
      };
      const plan = await planModel.create(plan1);
      const response = await makeCall(plan._id.toString(), adminToken, {
        status: false,
        pricePerMonth: 77,
      });
      const responseData = response.body;

      const data = await planModel.findOne({ _id: plan._id });

      expect(data?.status).toBe(false);
      expect(data?.pricePerMonth).toBe(77);
      expect(response.status).toBe(200);
      expect(responseData).toHaveProperty("message");
      expect(responseData.message).toBe("updated plan successfully");
      await plan.deleteOne();
    });
    it(" should update the specified fields", async () => {
      const plan1 = {
        duration: "3 monts",
        pricePerMonth: 393,
        planName: "gold",
        hoardingLimit: 53,
        status: true,
      };
      const plan = await planModel.create(plan1);
      const response = await makeCall(plan._id.toString(), adminToken, {
        planName: "no plan",
        duration: "10 months",
      });
      const responseData = response.body;

      const data = await planModel.findOne({ _id: plan._id });

      expect(data?.planName).toBe("no plan");
      expect(data?.duration).toBe("10 months");
      expect(response.status).toBe(200);
      expect(responseData).toHaveProperty("message");
      expect(responseData.message).toBe("updated plan successfully");
      await plan.deleteOne();
    });
  });
});

async function makeCall(planId: string, token: string, body: object) {
  const URL = `/api/plans/${planId}`;
  const response = await request(app)
    .put(URL)
    .send(body)
    .set("authorization", token);

  return response;
}
