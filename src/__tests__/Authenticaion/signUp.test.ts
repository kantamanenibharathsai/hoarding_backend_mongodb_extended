import app from "../../app";
import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";

import testDb from "../../Config/testDb";
import request from "supertest";
import userModel from "../../Models/userModel";
import * as otpLib from "../../Libray/otpLibrary";
import bcrypt from "bcrypt";

describe.skip("testing signup Route", () => {
  const db = new testDb();
  const sendOtpMock = jest.spyOn(otpLib, "sendOtp");
  const bcryptMock = jest.spyOn(bcrypt, "hash");

  beforeAll(async () => {
    await db.connect();
    bcryptMock.mockImplementation(() => {
      return Promise.resolve("ffwje;ohchoipphpw39u09fu00-i");
    });
  });
  afterAll(async () => {
    sendOtpMock.mockClear();
    await db.disconnect();
  });
  describe("testing payload validations for signp route", () => {
    it("should return error when empty payload sent", async () => {
      const response = await makeCall({});
      const data = response.body;
      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(5);
      expect(data[0]).toEqual({ message: "fullName field is empty" });
      expect(data[1]).toEqual({ message: "email field is empty" });
      expect(data[2]).toEqual({ message: "password field is empty" });
      expect(data[3]).toEqual({ message: "role field is empty" });
      expect(data[4]).toEqual({ message: "phone number field is empty" });
    });

    // should return error when we sent invalid types
    it("should return error when we sent invalid type of data", async () => {
      const response = await makeCall({
        fullName: 83,
        email: 738,
        password: {},
        role: 638,
        phNumber: 83984798,
      });
      const data = response.body;
      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(6);
      expect(data[0]).toEqual({ message: "fullName is not a string" });
      expect(data[1]).toEqual({ message: "email is not a string" });
      expect(data[2]).toEqual({ message: "invalid email structure" });
      expect(data[3]).toEqual({ message: "password is not a string" });
      expect(data[4]).toEqual({ message: "role is not a string" });
      expect(data[5]).toEqual({ message: "phNumber is not a string" });
    });

    // should return error when any one field is missing
    it("should return error when any one of feld is missing", async () => {
      const response = await makeCall({
        fullName: "vamshiKrishna",
        email: "vamshi@gmail.com",
        password: "lfslk@r3lo",
        role: "ADMIN",
      });
      const data = response.body;
      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(1);
      expect(data[0]).toEqual({ message: "phone number field is empty" });
    });
    it("should return error when email field is empty", async () => {
      const response = await makeCall({
        fullName: "vamshiKrishna",
        password: "lfslk@r3lo",
        role: "ADMIN",
        phNumber: "93984839909",
      });
      const data = response.body;
      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(1);
      expect(data[0]).toEqual({ message: "email field is empty" });
    });
    // shoud return error when sent invalid email format
    it("should return error when sent invalid email format --> when @ misssed", async () => {
      const response = await makeCall({
        fullName: "vamshiKrishna",
        password: "lfslk@r3lo",
        email: "vamshigmail.com",
        role: "ADMIN",
        phNumber: "93984839909",
      });
      const data = response.body;
      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(1);
      expect(data[0]).toEqual({ message: "invalid email structure" });
    });
    it("should return error when sent invalid email format --> when .*** missed", async () => {
      const response = await makeCall({
        fullName: "vamshiKrishna",
        password: "lfslk@r3lo",
        email: "vamshi@gmailcom",
        role: "ADMIN",
        phNumber: "93984839909",
      });
      const data = response.body;
      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(1);
      expect(data[0]).toEqual({ message: "invalid email structure" });
    });
    it("should return error when sent invalid email format --> when sent plain text", async () => {
      const response = await makeCall({
        fullName: "vamshiKrishna",
        password: "lfslk@r3lo",
        email: "vamshigmailcom",
        role: "ADMIN",
        phNumber: "93984839909",
      });
      const data = response.body;
      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(1);
      expect(data[0]).toEqual({ message: "invalid email structure" });
    });

    it("should validate and call controller function when every field is correct", async () => {
      sendOtpMock.mockImplementationOnce(() => {
        return Promise.resolve({ otp: 1234, createdAt: Date.now() });
      });
      const response = await makeCall({
        fullName: "vamshiKrishna",
        password: "lfslk@r3lo",
        email: "vamshi@gmail.com",
        role: "ADMIN",
        phNumber: "93984839909",
      });
      const data = response.body;

      expect(data.message).toEqual("user signedUp successfully");
      expect(data.data).toHaveProperty("id");
      expect(data.data).toHaveProperty("email");
      expect(data.data.email).toBe("vamshi@gmail.com");
      expect(
        await userModel.findOne({ _id: data.data.id }, { _id: 1 })
      ).toBeDefined();

      await userModel.deleteOne({ _id: data.data.id });
    });
  });

  describe("testing the functionality of the signup route", () => {
    it("should return error if email is already present", async () => {
      const payload = {
        fullName: "vamshiKrishna",
        password: "lfslk@r3lo",
        email: "vamshi@gmail.com",
        role: "ADMIN",
        phNumber: "93984839909",
      };
      const user = await userModel.create({
        fullName: payload.fullName,
        password: payload.password,
        email: payload.email,
        phNumber: "837449308",
        role: "ADMIN",
      });
      const response = await makeCall(payload);
      await userModel.deleteOne({ _id: user._id });
      expect(response.status).toBe(400);
      const data = response.body;
      expect(data.message).toBe("credentials  already present");
      expect(data.data.email).toBe(true);
      expect(data.data.number).toBe(false);
      // await user.deleteOne();
    });
    it("should return error if phone number  is already present", async () => {
      const payload = {
        fullName: "vamshiKrishna",
        password: "lfslk@r3lo",
        email: "vamshi@gmail.com",
        role: "ADMIN",
        phNumber: "93984839909",
      };
      const user = await userModel.create({
        fullName: payload.fullName,
        password: payload.password,
        email: "random@gmail.com",
        phNumber: payload.phNumber,
        role: "ADMIN",
      });
      const response = await makeCall(payload);
      await userModel.deleteOne({ _id: user._id });
      expect(response.status).toBe(400);
      const data = response.body;

      expect(data.message).toBe("credentials  already present");
      expect(data.data.email).toBe(false);
      expect(data.data.number).toBe(true);
      await userModel.deleteOne();
    });

    it("should return error otp sending failed", async () => {
      const payload = {
        fullName: "vamshiKrishna",
        password: "lfslk@r3lo",
        email: "vamshi@gmail.com",
        role: "ADMIN",
        phNumber: "93984839909",
      };
      sendOtpMock.mockImplementationOnce(() => {
        return Promise.reject({ message: "unable to send message" });
      });
      const response = await makeCall(payload);
      const data = response.body;
      expect(response.status).toBe(500);
      expect(data).toHaveProperty("message");
      expect(data.message).toBe("unable to send message");
    });

    it("should create user and send a verification otp", async () => {
      const payload = {
        fullName: "vamshiKrishna",
        password: "lfslk@r3lo",
        email: "vamshi@gmail.com",
        role: "ADMIN",
        phNumber: "93984839909",
      };
      sendOtpMock.mockImplementationOnce(() => {
        return Promise.resolve({ otp: 1234, createdAt: Date.now() });
      });

      const response = await makeCall(payload);
      const data = response.body;

      expect(data.message).toEqual("user signedUp successfully");
      expect(data.data).toHaveProperty("id");
      expect(data.data).toHaveProperty("email");
      expect(data.data.email).toBe("vamshi@gmail.com");
      expect(
        await userModel.findOne({ _id: data.data.id }, { _id: 1 })
      ).toBeDefined();

      await userModel.deleteOne({ _id: data.data.id });
    });
  });
});

async function makeCall(data: object) {
  const URL = "/api/auth/signUp";
  const response = await request(app).post(URL).send(data);
  return response;
}
