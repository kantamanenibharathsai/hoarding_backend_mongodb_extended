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

const customerDetails = {
  fullName: "vamshi",
  email: "vamshi@gmail.com",
  phNumber: "987984037",
};
const adminDetails = {
  fullName: "vamshiAdmin",
  email: "vamshiAdmin@gmail.com",
  phNumber: "987984037",
};
const sellerDatails = {
  fullName: "vamshisales",
  email: "vamshiSales@gmail.com",
  phNumber: "98798403",
};
const ownerDetails = {
  fullName: "vamshiOwner",
  email: "vamshiOwner@gmail.com",
  phNumber: "98798403",
};

describe("testing addplan route", () => {
  let customer: userType;
  let owner: userType;
  let admin: userType;
  let seller: userType;
  let customerToken: string;
  let ownerToken: string;
  let adminToken: string;
  let sellerToken: string;
  const db = new testDb();
  beforeAll(async () => {
    await db.connect();
    const prmArr = [
      generateCustomer(customerDetails),
      generateOwner(ownerDetails),
      generateAdmin(ownerDetails),
      generateSales(sellerDatails),
    ];
    const data = await Promise.all(prmArr);

    if (data[0] && data[1] && data[2] && data[3]) {
      customer = data[0];
      owner = data[1];
      admin = data[2];
      seller = data[3];
      customerToken = generateJwtToken({
        email: data[0]?.email,
        _id: data[0]?._id,
      });
      ownerToken = generateJwtToken({
        email: data[1]?.email,
        _id: data[1]?._id,
      });
      adminToken = generateJwtToken({
        email: data[2]?.email,
        _id: data[2]?._id,
      });
      sellerToken = generateJwtToken({
        email: data[3]?.email,
        _id: data[3]?._id,
      });
    }
  });

  afterAll(async () => {
    const prmArr = [
      deletUserById(customer._id),
      deletUserById(owner._id),
      deletUserById(admin._id),
      deletUserById(seller._id),
    ];
    await Promise.all(prmArr);
    jest.clearAllMocks();
    await db.disconnect();
  });
  describe("testing role access for the route", () => {
    it("should fail for customer", async () => {
      const payload = {};
      const response = await makeCall(payload, customerToken);
      const responseData = response.body;

      expect(response.status).toBe(401);
      expect(responseData).toHaveProperty("message");
      expect(responseData.message).toBe(
        "you do not have access to this resource"
      );
    });
    it("should have access to admin", async () => {
      const payload = {};
      const response = await makeCall(payload, adminToken);
      const responseData = response.body;

      expect(response.status).toBe(400);
      expect(responseData).toEqual(expect.any(Array));
    });
    it("should fail for owner", async () => {
      const payload = {};
      const response = await makeCall(payload, ownerToken);
      const responseData = response.body;

      expect(response.status).toBe(401);
      expect(responseData).toHaveProperty("message");
      expect(responseData.message).toBe(
        "you do not have access to this resource"
      );
    });
    it("should fail for seller", async () => {
      const payload = {};
      const response = await makeCall(payload, sellerToken);
      const responseData = response.body;

      expect(response.status).toBe(401);
      expect(responseData).toHaveProperty("message");
      expect(responseData.message).toBe(
        "you do not have access to this resource"
      );
    });
  });

  describe("testing the validation of payload for addplan route", () => {
    it("should fail if we send empty payload", async () => {
      const payload = {};
      const response = await makeCall(payload, adminToken);
      const responseData = response.body;

      expect(response.status).toBe(400);
      expect(responseData).toEqual(expect.any(Array));
      expect(responseData.length).toBe(4);
      expect(responseData[0]).toEqual({ message: "planName field is empty" });
      expect(responseData[1]).toEqual({ message: "duration field is empty" });
      expect(responseData[2]).toEqual({
        message: "pricePerMonth field is empty",
      });
      expect(responseData[3]).toEqual({
        message: "hoardingLimit field is empty",
      });
    });
    it("should fail if we send incorrect types of payload", async () => {
      const payload = {
        planName: 3787,
        duration: 8433,
        pricePerMonth: "393",
        hoardingLimit: "limit",
      };
      const response = await makeCall(payload, adminToken);
      const responseData = response.body;
      expect(response.status).toBe(400);
      expect(responseData).toEqual(expect.any(Array));
      expect(responseData.length).toBe(4);
      expect(responseData[0]).toEqual({ message: "planName is not a string" });
      expect(responseData[1]).toEqual({ message: "duration is not a string" });
      expect(responseData[2]).toEqual({
        message: "pricePerMonth is not a number",
      });
      expect(responseData[3]).toEqual({
        message: "hoardingLimit is not a number",
      });
    });
    it("should fail if plan name is missing in the payload", async () => {
      const payload = {
        duration: "3",
        pricePerMonth: 393,
        hoardingLimit: 53,
      };
      const response = await makeCall(payload, adminToken);
      const responseData = response.body;

      expect(response.status).toBe(400);
      expect(responseData).toEqual(expect.any(Array));
      expect(responseData.length).toBe(1);
      expect(responseData[0]).toEqual({ message: "planName field is empty" });
    });
    it("should fail if  duration and price is is missing in the payload", async () => {
      const payload = {
        planName: "gold",
        hoardingLimit: 53,
      };
      const response = await makeCall(payload, adminToken);
      const responseData = response.body;

      expect(response.status).toBe(400);
      expect(responseData).toEqual(expect.any(Array));
      expect(responseData.length).toBe(2);
      expect(responseData[0]).toEqual({ message: "duration field is empty" });
      expect(responseData[1]).toEqual({
        message: "pricePerMonth field is empty",
      });
    });
    it("should validate and call the controller function if we sent correct payload", async () => {
      const payload = {
        duration: "3monts",
        pricePerMonth: 393,
        planName: "gold",
        hoardingLimit: 53,
      };
      const response = await makeCall(payload, adminToken);
      const responseData = response.body;

      expect(response.status).toBe(200);
      expect(responseData).toHaveProperty("message");
      expect(responseData.message).toBe("created plan successfully");
      expect(responseData).toHaveProperty("data");
      const data = responseData.data;
      const planDoc = await planModel.findOne({ _id: data._id });
      expect(planDoc).not.toBeNull();
      expect(data.planName).toBe(payload.planName);
      expect(data.duration).toBe(payload.duration);
      expect(data.pricePerMonth).toBe(payload.pricePerMonth);
      expect(data.hoardingLimit).toBe(payload.hoardingLimit);
      await planDoc?.deleteOne();
    });
  });
  describe("testing the functionality of the add plan route", () => {
    it(" should fail if plan already exists ", async () => {
      const payload = {
        duration: "3monts",
        pricePerMonth: 393,
        planName: "gold",
        hoardingLimit: 53,
        status: true,
      };
      const plan = await planModel.create(payload);
      const response = await makeCall(payload, adminToken);
      const responseData = response.body;
      expect(response.status).toBe(400);
      console.log(responseData);
      expect(responseData).toEqual({
        message: "plan name already exists, please try again with another name",
      });
      await plan.deleteOne();
    });
    it(" should create a  plan in the db", async () => {
      const payload = {
        duration: "3monts",
        pricePerMonth: 393,
        planName: "gold",
        hoardingLimit: 53,
      };

      const response = await makeCall(payload, adminToken);
      const responseData = response.body;

      expect(response.status).toBe(200);
      expect(responseData.message).toEqual("created plan successfully");
      const data = responseData.data;
      expect(data.duration).toBe(payload.duration);
      expect(data.pricePerMonth).toBe(payload.pricePerMonth);
      expect(data.planName).toBe(payload.planName);
      expect(data.hoardingLimit).toBe(payload.hoardingLimit);
      await planModel.deleteOne({ _id: data._id });
    });
  });
});

async function makeCall(data: object, token: string) {
  const URL = "/api/plans/";
  const response = await request(app)
    .post(URL)
    .set("authorization", token)
    .send(data);
  return response;
}
