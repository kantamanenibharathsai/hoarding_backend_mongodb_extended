import request from "supertest";
import testDb from "../../Config/testDb";
import app from "../../app";
import {
  generateAdmin,
  generateCustomer,
  generateOwner,
  generateSales,
} from "../../helpers/testUser";
import { generateJwtToken } from "../../Libray/userLibrary";
import { deletUserById } from "../../Libray/userLibrary";
import { userType } from "../../Models/userModel";

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

describe("testing add booking route", () => {
  let db = new testDb();
  let customer: userType;
  let owner: userType;
  let customerToken: string;
  let ownerToken: string;
  beforeAll(async () => {
    await db.connect();
    const prmArr = [
      generateCustomer(customerDetails),
      generateOwner(adminDetails),
    ];
    const data = await Promise.all(prmArr);

    if (data[0] && data[1]) {
      customer = data[0];
      owner = data[1];

      customerToken = generateJwtToken({
        email: data[0]?.email,
        _id: data[0]?._id,
      });
      ownerToken = generateJwtToken({
        email: data[1]?.email,
        _id: data[1]?._id,
      });
    }
  });

  afterAll(async () => {
    const prmArr = [deletUserById(customer._id), deletUserById(owner._id)];
    await Promise.all(prmArr);
    jest.clearAllMocks();
    await db.disconnect();
  });

  describe("testing validation of addBooking route", () => {
    it("should contain hoardingId and bookingMode", async () => {
      const response = await makeCall({}, ownerToken);
      const responseData = response.body;
      console.log(responseData);
      expect(responseData).toEqual(expect.any(Array));
      expect(responseData.length).toBe(2);
      expect(responseData[0]).toHaveProperty("message");
      expect(responseData[0].message).toBe("hoardingId field is empty");
      expect(responseData[1]).toHaveProperty("message");
      expect(responseData[1].message).toBe("bookingMode field is empty");
    });
    it("should fail if sent invalid type of data", async () => {
      const payload = {
        hoardingId: 37,
        customerId: 993,
        bookingMode: 93,
        customerEmail: true,
        customerName: 3793,
        customerPhoneNumber: 24,
        advanceAmount: "rasengan",
        discountPercent: "abc",
      };
      const response = await makeCall(payload, ownerToken);
      const responseData = response.body;
      console.log(responseData);
      expect(responseData).toEqual(expect.any(Array));
      expect(responseData.length).toBe(10);
      expect(responseData[0]).toHaveProperty("message");
      expect(responseData[0].message).toBe("hoardingId field is not a string");
      expect(responseData[1]).toHaveProperty("message");
      expect(responseData[1].message).toBe("customer Id is not a string");
      expect(responseData[2]).toHaveProperty("message");
      expect(responseData[2].message).toBe("bookingMode field is not a string");
      expect(responseData[3]).toHaveProperty("message");
      expect(responseData[3].message).toBe(
        "customeremail is not a valid string"
      );
      expect(responseData[4]).toHaveProperty("message");
      expect(responseData[4].message).toBe("customerName is not a string");
      expect(responseData[5]).toHaveProperty("message");
      expect(responseData[5].message).toBe(
        "customerPhoneNumber is not a valid string"
      );
      expect(responseData[6]).toHaveProperty("message");
      expect(responseData[6].message).toBe("advance amount is not a number");
      expect(responseData[7]).toHaveProperty("message");
      expect(responseData[7].message).toBe("discount Percent is not number");
      expect(responseData[8]).toHaveProperty("message");

      expect(responseData[8].message).toBe(
        `cannot pay advance amount in ${payload.bookingMode} booking mode`
      );
      expect(responseData[9]).toHaveProperty("message");
      expect(responseData[9].message).toBe(
        `cannot add discount in ${payload.bookingMode} booking`
      );
    });
    it("should fail if discountPercent provided in online booking by customer ", async () => {
      const payload = {
        discountPercent: 30,
        bookingMode: "online",
      };

      const response = await makeCall(payload, customerToken);
      const responseData = response.body;
      console.log(responseData);
      expect(responseData).toEqual(expect.any(Array));
      expect(responseData[0]).toHaveProperty("message");
      expect(responseData[0].message).toBe("hoardingId field is empty");
      expect(responseData[1]).toHaveProperty("message");
      expect(responseData[1].message).toBe(
        "cannot add discount in online booking"
      );
    });
    it.only("should call the controller function if payload is correct", async () => {
      const payload = {
        hoardingId: "HD1234",
        startDate: "2024-05-10",
        endDate: "2024-05-20",
        bookingMode: "OFFLINE",
        customerEmail: "example@example.com",
        customerName: "John Doe",
        customerId: "C56789",
        customerPhoneNumber: "123-456-7890",
        features: "LED Display",
        advanceAmount: 500,
        discountPercent: 10,
      };
      const response = await makeCall(payload, ownerToken);
      const responseData = response.body;
      expect(response.status).toBe(400);
      expect(responseData).toEqual(expect.any(Array));
      debugger;
    });
  });
});

async function makeCall(data: object, userToken?: string | undefined) {
  const url = "/api/booking";
  let token = "";
  if (userToken != undefined) {
    token = userToken;
  }
  const result = await request(app)
    .post(url)
    .set("authorization", token)
    .send(data);
  return result;
}
