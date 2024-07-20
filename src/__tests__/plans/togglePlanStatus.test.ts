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

  describe("testing the functionality of the togglePlan route", () => {
    it("should return error if planId is not a valid id and status is empty ", async () => {
      const response = await makeCall("token", adminToken, {});
      const responseData = response.body;

      expect(responseData).toEqual(expect.any(Array));
      expect(responseData.length).toBe(2);
      expect(responseData[0]).toEqual({
        message: "planId is not a valid object Id",
      });
      expect(responseData[1]).toEqual({
        message: "status field is not a boolean value",
      });
    });
    it("should  return error if status field is absent ", async () => {
      let objId = "507f1f77bcf86cd799439011";
      const response = await makeCall(objId, adminToken, {});
      const responseData = response.body;

      expect(responseData).toEqual(expect.any(Array));
      expect(responseData.length).toBe(1);

      expect(responseData[0]).toEqual({
        message: "status field is not a boolean value",
      });
    });
    it("should return error if plan is not found in the db", async () => {
      let objId = "507f1f77bcf86cd799439011";
      const response = await makeCall(objId, adminToken, { status: false });
      const responseData = response.body;

      expect(response.status).toBe(400);
      expect(responseData).toHaveProperty("message");
      expect(responseData.message).toBe(
        "plan not found with correspondin plan Id"
      );
    });
    it.only("should return error if plan is not found in the db", async () => {
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
      });
      const responseData = response.body;
      console.log(responseData);
      const data = await planModel.findOne({ _id: plan._id });
      console.log(data);
      expect(data?.status).toBe(false);
      expect(response.status).toBe(200);
      expect(responseData).toHaveProperty("message");
      expect(responseData.message).toBe("updated status");
      await plan.deleteOne();
    });
  });
});

async function makeCall(planId: string, token: string, body: object) {
  const URL = `/api/plans/toggleState/${planId}`;
  const response = await request(app)
    .put(URL)
    .send(body)
    .set("authorization", token);

  return response;
}
