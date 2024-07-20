import app from "../../app";
import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";
import request from "supertest";
import userModel from "../../Models/userModel";
import * as otpLib from "../../Libray/otpLibrary";
import bcrypt from "bcrypt";
import { promises } from "nodemailer/lib/xoauth2";
import testDb from "../../Config/testDb";

describe("testing signup Route", () => {
  const db = new testDb();
  const sendOtpMock = jest.spyOn(otpLib, "sendOtp");
  const userModelMock = jest.spyOn(userModel, "findOne");
  beforeAll(async () => {
    await db.connect();
    sendOtpMock.mockImplementation(() => {
      return Promise.resolve({ otp: 1234, createdAt: Date.now() });
    });
  });
  afterAll(async () => {
    await db.disconnect();
    jest.clearAllMocks();
  });

  describe("testing payload validations for forget Password route", () => {
    it("should return error when empty payload sent", async () => {
      const response = await makeCall({});
      const data = response.body;
      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(1);
      expect(data[0]).toEqual({ message: "email field is emtpy" });
    });
    it("should return error when sent diff type of data", async () => {
      const payload = {
        email: 3323,
      };
      const response = await makeCall(payload);
      const data = response.body;
      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(2);
      expect(data[0]).toEqual({ message: "email field is not a string" });
      expect(data[1]).toEqual({ message: "invalid email structure" });
    });
    it("should return error when sent invalid email", async () => {
      const payload = {
        email: "vamshigmailcom",
      };
      const response = await makeCall(payload);
      const data = response.body;
      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(1);
      expect(data[0]).toEqual({ message: "invalid email structure" });
    });
    it("should validate and call forget password controller if payload is valid", async () => {
      //should return user not found , this will indicatte it indeed called controller function
      const payload = {
        email: "forgetPass@gmail.com",
      };
      const response = await makeCall(payload);
      const data = response.body;
      expect(response.status).toBe(400);
      expect(data).toHaveProperty("message");
      expect(data.message).toBe("user is not found, please check email");
    });
  });

  describe("testing the functionality of the forget Password route", () => {
    // if user is found return send otp to his email
    it("should return error if user with email is not found", async () => {
      const payload = {
        email: "forgetPass@gmail.com",
      };
      const response = await makeCall(payload);
      const data = response.body;
      expect(response.status).toBe(400);
      expect(data).toHaveProperty("message");
      expect(data.message).toBe("user is not found, please check email");
    });
    it("should send otp when user is found", async () => {
      const user = await userModel.create({
        email: "forgetTest@gmail.com",
        password: "12345",
        role: "ADMIN",
        fullName: "vamshi",
        phNumber: "7489374939",
      });
      const payload = {
        email: "forgetTest@gmail.com",
      };
      const response = await makeCall(payload);
      const data = response.body;
      expect(response.status).toBe(200);
      expect(data).toHaveProperty("message");
      expect(data.message).toBe("otp has sent to reset password");
      const userDoc = await userModel.findOne(
        { _id: user._id },
        { resetPassword: 1 }
      );

      expect(userDoc?.resetPassword.otp).toBe("1234");
      expect(sendOtpMock).toBeCalled();
      await user.deleteOne();
    });
    it("should return error if database interaction failed due to some reason", async () => {
      userModelMock.mockRejectedValueOnce({
        err: "something unexpected happened",
      });
      const payload = {
        email: "forgetTest@gmail.com",
      };
      const response = await makeCall(payload);
      const data = response.body;
      expect(response.status).toBe(500);
      expect(data).toHaveProperty("err");
      expect(data.err).toBe("something unexpected happened");
    });
  });
});

async function makeCall(data: object) {
  const URL = "/api/auth/forgetPassword";
  const response = await request(app).post(URL).send(data);
  return response;
}
