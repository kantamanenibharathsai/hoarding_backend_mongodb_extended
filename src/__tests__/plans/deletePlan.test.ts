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
import { answerQuery } from "../../Controllers/helpControllers";

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

  let adminToken: string;
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

      adminToken = generateJwtToken({
        email: data[2]?.email,
        _id: data[2]?._id,
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

  describe("testing the functionality of the add plan route", () => {
    it("should fail if we send invalid payload", async () => {
      const response = await makeCall("9303909", adminToken);
      const responseData = response.body;

      expect(response.status).toBe(400);
      expect(responseData).toEqual(expect.any(Array));
      expect(responseData.length).toBe(1);
      expect(responseData[0]).toEqual({
        message: "planId is not a valid object Id",
      });
    });
    it("should delete the plan fom the db", async () => {
      const payload = {
        duration: "3monts",
        pricePerMonth: 393,
        planName: "gold",
        hoardingLimit: 53,
        status: true,
      };
      const plan = await planModel.create(payload);
      const response = await makeCall(plan._id.toString(), adminToken);
      const responseData = response.body;

      expect(response.status).toBe(200);
      expect(responseData).toEqual({ message: "deleted plan successfully" });
      const planDoc = await planModel.findOne({ _id: plan._id });
      expect(planDoc).toBeNull();
    });
  });
});

async function makeCall(planId: string | undefined, token: string) {
  let URL: string;
  if (planId) URL = `/api/plans/${planId}`;
  else URL = "/api/plans";
  const response = await request(app).delete(URL).set("authorization", token);

  return response;
}
