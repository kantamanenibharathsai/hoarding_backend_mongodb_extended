import app from "../../app";
import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";
import request from "supertest";
import userModel, { userType } from "../../Models/userModel";
import * as otpLib from "../../Libray/otpLibrary";
import { generateJwtToken } from "../../Libray/userLibrary";
import { Document } from "mongoose";
import bcrypt from "bcrypt";
import testDb from "../../Config/testDb";
import mongoose from "mongoose";

const userDetails = {
  fullName: "vamshiKrishna",
  email: "vamshi@gmail.com",
  password: "123456",
  role: "ADMIN",
  phNumber: "6486493893",
};
let userId = "";

describe("testing change password  Route", () => {
  let db = new testDb();
  let USER: Document<unknown, {}, userType> &
    userType &
    Required<{
      _id: string;
    }>;

  const sendOtpMock = jest.spyOn(otpLib, "sendOtp");
  const findUserMock = jest.spyOn(userModel, "findOne");
  beforeAll(async () => {
    await db.connect();
    const USER = await userModel.create(userDetails);
    userId = USER._id;
    sendOtpMock.mockImplementation(() => {
      return Promise.resolve({ otp: 1234, createdAt: Date.now() });
    });
  });
  afterAll(async () => {
    await db.disconnect();
    jest.clearAllMocks();
  });

  describe("testing payload validations for change Password route", () => {
    it("should return error token is not found", async () => {
      const response = await makeCall({}, false);
      const data = response.body;

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("message");
      expect(data.message).toBe("invalid token sent please check");
    });
    it("should return when empty payload sent", async () => {
      const payload = {};
      const response = await makeCall(payload);
      const data = response.body;
      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(1);
      expect(data[0]).toEqual({ message: "newPassword field is empty" });
    });
    it("should return when newPassword field is not a string", async () => {
      const payload = {
        newPassword: 8793,
      };
      const response = await makeCall(payload);
      const data = response.body;
      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(1);
      expect(data[0]).toEqual({ message: "newPassword field is not a string" });
    });
    it("should call controller function when payload is valid ", async () => {
      const payload = {
        newPassword: "fsdolsleo",
      };
      findUserMock
        .mockResolvedValueOnce({ role: "CUSTOMER" })
        .mockResolvedValueOnce(undefined);
      const response = await makeCall(payload);
      const data = response.body;
      expect(response.status).toBe(400);
      expect(data).toHaveProperty("message");
      expect(data.message).toBe("user not found please login again");
    });
  });

  describe("testing the functionality of the forget Password route", () => {
    it("should return error if user is not found", async () => {
      const payload = {
        newPassword: "csdkljf809",
      };
      findUserMock
        .mockResolvedValueOnce({ role: "CUSTOMER" })
        .mockResolvedValueOnce(undefined);
      const response = await makeCall(payload);
      const data = response.body;
      expect(response.status).toBe(400);
      expect(data).toHaveProperty("message");
      expect(data.message).toBe("user not found please login again");
    });

    it("should update the password ", async () => {
      const payload = {
        newPassword: "csdkljf809",
      };
      const response = await makeCall(payload);
      const data = response.body;
      expect(response.status).toBe(200);
      expect(data).toHaveProperty("message");
      expect(data.message).toBe("updated password successfully");
      const userDoc = await userModel.findOne({ _id: userId }, { password: 1 });
      const isMatched = await bcrypt.compare(
        payload.newPassword,
        userDoc?.password as string
      );
      expect(isMatched).toBe(true);
    });

    it("should return error if db interaction failed ", async () => {
      const payload = {
        newPassword: "csdkljf809",
      };
      findUserMock
        .mockResolvedValueOnce({ role: "CUSTOMER" })
        .mockRejectedValueOnce({
          err: "something unexpected happened",
        });

      const response = await makeCall(payload);
      const data = response.body;
      expect(response.status).toBe(500);
      expect(data).toHaveProperty("err");
      expect(data.err).toBe("something unexpected happened");
    });
  });
});

async function makeCall(data: object, gentToken: boolean = true) {
  let token =
    gentToken === true
      ? generateJwtToken({
          email: userDetails.email,
          _id: userId,
        })
      : "";

  const URL = "/api/auth/changePassword";
  const response = await request(app)
    .post(URL)
    .set("authorization", token)
    .send(data);
  return response;
}
