import app from "../../app";
import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";
import request from "supertest";
import userModel from "../../Models/userModel";
import * as otpLib from "../../Libray/otpLibrary";
import bcrypt from "bcrypt";
import testDb from "../../Config/testDb";

describe("testing signup Route", () => {
  const db = new testDb();
  const sendOtpMock = jest.spyOn(otpLib, "sendOtp");
  const bcryptMock = jest.spyOn(bcrypt, "compare");
  beforeAll(async () => {
    await db.connect();
    bcryptMock.mockImplementation(() => {
      return Promise.resolve("ffwje;ohchoipphpw39u09fu00-i");
    });
  });
  afterAll(async () => {
    await db.disconnect();
    sendOtpMock.mockClear();
  });

  // don't need to test the structure of email because its already tested in sign up route
  describe("testing payload validations for login route", () => {
    it("should return error when empty payload sent", async () => {
      const response = await makeCall({});
      const data = response.body;
      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(2);
      expect(data[0]).toEqual({ message: "email field is emtpy" });
      expect(data[1]).toEqual({ message: "password field is empty" });
    });
    // check for invalid types
    it("should return error when sent diff type of data", async () => {
      const payload = {
        email: 3323,
        password: 5432,
      };
      const response = await makeCall(payload);
      const data = response.body;
      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(3);
      expect(data[0]).toEqual({ message: "email field is not a string" });
      expect(data[1]).toEqual({ message: "invalid email structure" });
      expect(data[2]).toEqual({ message: "password is not a string" });
    });

    //check for invalid types

    // check if a field is missing
    it("should return error email missed in payload", async () => {
      const payload = {
        password: "lkjcpwojsf",
      };
      const response = await makeCall(payload);
      const data = response.body;
      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(1);
      expect(data[0]).toEqual({ message: "email field is emtpy" });
    });

    it("should return error password missed in payload", async () => {
      const payload = {
        email: "vamshi@gmail.com",
      };
      const response = await makeCall(payload);
      const data = response.body;
      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(1);
      expect(data[0]).toEqual({ message: "password field is empty" });
    });

    it("should call the login function when sent valid payload", async () => {
      const payload = {
        email: "random@gmail.com",
        password: "fkcjhw303",
      };
      const response = await makeCall(payload);
      const data = response.body;
      //it called the login controller thats why
      // its showing user is not found
      // it means the validator called the next function successfully
      expect(response.status).toBe(400);
      expect(data).toHaveProperty("message");
      expect(data.message).toBe("user is not found please check the email");
    });
  });

  describe("testing the functionality of the login route", () => {
    // test whether user exists or not
    it("should respond if user is not found ", async () => {
      const payload = {
        email: "ocij0f0@gmail.com",
        password: "clwkej939",
      };
      const response = await makeCall(payload);
      const data = response.body;
      expect(response.status).toBe(400);
      expect(data).toEqual({
        message: "user is not found please check the email",
      });
    });
    // write another case , it should send otp if not verified
    it("should send verification mail if user is not verified ", async () => {
      const user = await userModel.create({
        email: "loginTest@gmail.com",
        password: "12345",
        role: "ADMIN",
        fullName: "vamshi",
        phNumber: "7489374939",
        verified: false,
      });
      sendOtpMock.mockImplementationOnce(() => {
        return Promise.resolve({ otp: 1234, createdAt: Date.now() });
      });
      const payload = {
        email: "loginTest@gmail.com",
        password: "123456",
      };
      const response = await makeCall(payload);
      const data = response.body;

      expect(response.status).toBe(200);
      expect(data).toEqual({
        message:
          "email is not verified,an otp is sent to mail please verify first",
      });
      const userDoc = await userModel.findOne(
        { _id: user._id },
        { verification: 1 }
      );
      expect(userDoc?.verification.otp).toBe("1234");
      await userDoc?.deleteOne();
    });
    it("should send error response if password is wrong", async () => {
      const user = await userModel.create({
        email: "loginTest@gmail.com",
        password: "12345",
        role: "ADMIN",
        fullName: "vamshi",
        phNumber: "7489374939",
        verified: true,
      });
      bcryptMock.mockImplementationOnce(() => {
        return Promise.resolve(false);
      });
      const payload = {
        email: "loginTest@gmail.com",
        password: "123456",
      };
      const response = await makeCall(payload);
      const data = response.body;
      expect(response.status).toBe(200);
      expect(data).toHaveProperty("message");
      expect(data.message).toBe("password is incorrect,try again");
      await user?.deleteOne();
    });

    it("should login the user if user exists and password is correct", async () => {
      const user = await userModel.create({
        email: "loginTest@gmail.com",
        password: "123456789",
        role: "ADMIN",
        fullName: "vamshi",
        phNumber: "7489374939",
        verified: true,
      });
      bcryptMock.mockImplementationOnce(() => {
        return Promise.resolve(true);
      });
      const payload = {
        email: "loginTest@gmail.com",
        password: "123456789",
      };
      const response = await makeCall(payload);
      const data = response.body;
      expect(response.status).toBe(200);
      expect(data).toHaveProperty("message");
      expect(data.message).toBe("loggedIn successully");
      expect(data).toHaveProperty("data");
      expect(data.data).toHaveProperty("token");
      expect(data.data.token.length).toBeGreaterThan(0);
      await user?.deleteOne();
    });

    it("should return error if something unexpected happened in bcrpt or interacting with database", async () => {
      const user = await userModel.create({
        email: "loginTest@gmail.com",
        password: "123456789",
        role: "ADMIN",
        fullName: "vamshi",
        phNumber: "7489374939",
        verified: true,
      });
      bcryptMock.mockImplementationOnce(() => {
        return Promise.reject({ err: "something unexpected happened" });
      });
      const payload = {
        email: "loginTest@gmail.com",
        password: "123456789",
      };
      const response = await makeCall(payload);
      const data = response.body;

      expect(response.status).toBe(500);
      expect(data).toHaveProperty("err");
      expect(data.err).toBe("something unexpected happened");

      await user?.deleteOne();
    });
  });
});

async function makeCall(data: object) {
  const URL = "/api/auth/login";
  const response = await request(app).post(URL).send(data);
  return response;
}
