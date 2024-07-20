import app from "../../app";
import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";
import request from "supertest";
import userModel, { userType } from "../../Models/userModel";
import * as otpLib from "../../Libray/otpLibrary";
import { generateJwtToken } from "../../Libray/userLibrary";
import { Document } from "mongoose";
import bcrypt from "bcrypt";
import testDb from "../../Config/testDb";

describe("testing verifyOtp   Route", () => {
  let USER: Document<unknown, {}, userType> &
    userType &
    Required<{
      _id: string;
    }>;
  const db = new testDb();
  const findUserMock = jest.spyOn(userModel, "findOne");
  const verifyForgetMock = jest.spyOn(otpLib, "verifyForgetPassOtp");
  beforeAll(async () => {
    await db.connect();
  });
  afterAll(async () => {
    await db.disconnect();
    jest.clearAllMocks();
  });

  describe("testing payload validations for change Password route", () => {
    it("should return error when empty payload sent", async () => {
      const response = await makeCall({});
      const data = response.body;

      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(3);
      expect(data[0]).toEqual({ message: "userId field is empty" });
      expect(data[1]).toEqual({ message: "otp field is empty" });
      expect(data[2]).toEqual({ message: "verificationType field is empty" });
    });

    it("should return error when sent different type of data", async () => {
      const payload = {
        userId: 3323,
        otp: 5432,
        verificationType: {},
      };
      const response = await makeCall(payload);
      const data = response.body;
      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(3);
      expect(data[0]).toEqual({ message: "userId is not a string" });
      expect(data[1]).toEqual({ message: "otp is not a string" });
      expect(data[2]).toEqual({ message: "verificationType is not a string" });
    });

    it("should return error userId missed in payload", async () => {
      const payload = {
        otp: "1234",
        verificationType: "forgotPassword",
      };
      const response = await makeCall(payload);
      const data = response.body;

      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(1);
      expect(data[0]).toEqual({ message: "userId field is empty" });
    });

    it("should return error if verificationType is missed in payload", async () => {
      const payload = {
        userId: "39930",
        otp: "1234",
      };
      const response = await makeCall(payload);
      const data = response.body;
      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(2);
      expect(data[1]).toEqual({ message: "verificationType field is empty" });
    });

    it("should return errror if we pass invalid mongodb object id", async () => {
      const payload = {
        userId: "39930",
        otp: "1234",
        verificationType: "forgotPassword",
      };
      const response = await makeCall(payload);
      const data = response.body;
      expect(response.status).toBe(400);
      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(1);
      expect(data[0]).toEqual({ message: "userId is not a type of objectId" });
    });
    it("should call the controller function if payload is correct", async () => {
      const payload = {
        userId: "65eecffd14cf75a17f7e6057",
        otp: "1234",
        verificationType: "forgotPassword",
      };
      const response = await makeCall(payload);
      const data = response.body;
      expect(response.status).toBe(400);
      expect(data).toHaveProperty("message");
      expect(data.message).toBe("user is not found");
    });
  });

  describe("testing the functionality of the verifyOtp route", () => {
    // should call verifyForgotPasss
    describe("forgetPassword verification flow", () => {
      it("should call the verifyForgetPassOtp lib function", async () => {
        const payload = {
          userId: "65eecffd14cf75a17f7e6057",
          otp: "1234",
          verificationType: "forgotPassword",
        };
        const response = await makeCall(payload);
        const data = response.body;
        expect(response.status).toBe(400);
        expect(data).toHaveProperty("message");
        expect(data.message).toBe("user is not found");
        expect(verifyForgetMock).toBeCalled();
      });
      // should return error if user not found
      it("should fail if user is not found", async () => {
        const payload = {
          userId: "65eecffd14cf75a17f7e6057",
          otp: "1234",
          verificationType: "forgotPassword",
        };
        const response = await makeCall(payload);
        const data = response.body;
        expect(response.status).toBe(400);
        expect(data).toHaveProperty("message");
        expect(data.message).toBe("user is not found");
      });
      // if user not generated any pass it should show
      it("should respond error if use has not generated any otp", async () => {
        const userDetails = {
          fullName: "vamshiKrishna",
          email: "vamshi@gmail.com",
          password: "123456",
          role: "ADMIN",
          phNumber: "6486493893",
          resetPassword: {},
        };
        const user = await userModel.create(userDetails);
        const payload = {
          userId: user._id,
          otp: "1234",
          verificationType: "forgotPassword",
        };
        const response = await makeCall(payload);
        const data = response.body;

        expect(response.status).toBe(400);
        expect(data).toHaveProperty("message");
        expect(data.message).toBe("user has not generated any otp");
        await user.deleteOne();
      });

      it("should respond error if otp is expired", async () => {
        const userDetails = {
          fullName: "vamshiKrishna",
          email: "vamshi@gmail.com",
          password: "123456",
          role: "ADMIN",
          phNumber: "6486493893",
          resetPassword: {
            otp: "1234",
            createdAt: Date.now() - 120000,
          },
        };
        const user = await userModel.create(userDetails);
        const payload = {
          userId: user._id,
          otp: "1234",
          verificationType: "forgotPassword",
        };
        const response = await makeCall(payload);
        const data = response.body;

        expect(response.status).toBe(400);
        expect(data).toHaveProperty("message");
        expect(data.message).toBe("otp is expired please try again");
        await user.deleteOne();
      });
      it("should respond error if sent incorrect otp ", async () => {
        const userDetails = {
          fullName: "vamshiKrishna",
          email: "vamshi@gmail.com",
          password: "123456",
          role: "ADMIN",
          phNumber: "6486493893",
          resetPassword: {
            otp: "1356",
            createdAt: Date.now() + 30000,
          },
        };
        const user = await userModel.create(userDetails);
        const payload = {
          userId: user._id,
          otp: "1234",
          verificationType: "forgotPassword",
        };
        const response = await makeCall(payload);
        const data = response.body;

        expect(response.status).toBe(400);
        expect(data).toHaveProperty("message");
        expect(data.message).toBe("otp is not matching try again");
        await user.deleteOne();
      });

      it("should return token if otp is verified", async () => {
        const userDetails = {
          fullName: "vamshiKrishna",
          email: "vamshi@gmail.com",
          password: "123456",
          role: "ADMIN",
          phNumber: "6486493893",
          resetPassword: {
            otp: "1234",
            createdAt: Date.now() + 30000,
          },
        };
        const user = await userModel.create(userDetails);
        const payload = {
          userId: user._id,
          otp: "1234",
          verificationType: "forgotPassword",
        };
        const response = await makeCall(payload);
        const data = response.body;
        expect(response.status).toBe(200);
        expect(data).toHaveProperty("message");
        expect(data).toHaveProperty("token");
        expect(data.message).toBe("otp verified successfully");
        expect(data.token.length).toBeGreaterThan(0);
        await user.deleteOne();
      });
    });
    // should verify email
    describe("testing verify email flow", () => {
      it("should call the verifyForgetPassOtp lib function", async () => {
        const payload = {
          userId: "65eecffd14cf75a17f7e6057",
          otp: "1234",
          verificationType: "forgotPassword",
        };
        const response = await makeCall(payload);
        const data = response.body;
        expect(response.status).toBe(400);
        expect(data).toHaveProperty("message");
        expect(data.message).toBe("user is not found");
        expect(verifyForgetMock).toBeCalled();
      });

      it("should fail if user is not found", async () => {
        const payload = {
          userId: "65eecffd14cf75a17f7e6057",
          otp: "1234",
          verificationType: "EMAILverification",
        };
        const response = await makeCall(payload);
        const data = response.body;
        expect(response.status).toBe(400);
        expect(data).toHaveProperty("err");
        expect(data.err).toBe("user not found");
      });

      it("should respond error if use has not generated any otp", async () => {
        const userDetails = {
          fullName: "vamshiKrishna",
          email: "vamshi@gmail.com",
          password: "123456",
          role: "ADMIN",
          phNumber: "6486493893",
          verification: {},
        };
        const user = await userModel.create(userDetails);
        const payload = {
          userId: user._id,
          otp: "1234",
          verificationType: "EMAILverification",
        };
        const response = await makeCall(payload);
        const data = response.body;
        expect(response.status).toBe(400);
        expect(data).toHaveProperty("message");
        expect(data.message).toBe(
          "OTP is not generated , generate an otp first"
        );
        await user.deleteOne();
      });

      it("should respond error if otp is expired", async () => {
        try {
          const userDetails = {
            fullName: "vamshiKrishna",
            email: "vamshi@gmail.com",
            password: "123456",
            role: "ADMIN",
            phNumber: "6486493893",
            verification: {
              otp: "1234",
              createdAt: Date.now() - 120000,
            },
          };
          const user = await userModel.create(userDetails);
          const payload = {
            userId: user._id,
            otp: "1234",
            verificationType: "EMAILverification",
          };
          const response = await makeCall(payload);
          const data = response.body;
          expect(response.status).toBe(400);
          expect(data).toHaveProperty("message");
          expect(data.message).toBe("otp is expired generate new one");
          await user.deleteOne();
        } catch (err) {
          console.log(err);
        }
      });
      it("should respond error if sent incorrect otp ", async () => {
        const userDetails = {
          fullName: "vamshiKrishna",
          email: "vamshi@gmail.com",
          password: "123456",
          role: "ADMIN",
          phNumber: "6486493893",
          verification: {
            otp: "1234",
            createdAt: Date.now() + 30000,
          },
        };
        const user = await userModel.create(userDetails);
        // const user = { _id: "strin" };
        console.log(user._id);
        const payload = {
          userId: user._id,
          otp: "1278",
          verificationType: "EMAILverification",
        };
        const response = await makeCall(payload);
        const data = response.body;
        expect(response.status).toBe(400);
        expect(data).toHaveProperty("message");
        expect(data.message).toBe("otp is not matching try again");
        await user.deleteOne();
      });

      it("should return token if otp is verified", async () => {
        const userDetails = {
          fullName: "vamshiKrishna",
          email: "vamshi@gmail.com",
          password: "123456",
          role: "ADMIN",
          phNumber: "6486493893",
          verification: {
            otp: "1234",
            createdAt: Date.now() + 30000,
          },
        };
        const user = await userModel.create(userDetails);
        const payload = {
          userId: user._id,
          otp: "1234",
          verificationType: "EMAILverification",
        };
        const response = await makeCall(payload);
        const data = response.body;
        expect(response.status).toBe(200);
        expect(data).toHaveProperty("message");
        expect(data).toHaveProperty("token");
        expect(data.message).toBe("otp verified successfully");
        expect(data.token.length).toBeGreaterThan(0);
        await user.deleteOne();
      });
    });

    it("should respond if user we mention invalid verification type", async () => {
      const payload = {
        userId: "65eecffd14cf75a17f7e6057",
        verificationType: "randomType",
        otp: "1234",
      };
      const response = await makeCall(payload);
      const data = response.body;
      expect(response.status).toBe(200);
      expect(data).toHaveProperty("message");
      expect(data.message).toBe("invalid verification type");
    });
  });
});

async function makeCall(data: object) {
  const URL = "/api/auth/verifyOtp";
  const response = await request(app).post(URL).send(data);
  return response;
}
