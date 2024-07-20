import hoardingModel from "../../Models/hoardingModel";
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

describe("testing add hoarding route", () => {
  let customer: userType;
  let owner: userType;
  let admin: userType;
  let seller: userType;
  let customerToken: string;
  let ownerToken: string;
  let adminToken: string;
  let sellerToken: string;
  const createHoardingMock = jest.spyOn(hoardingModel, "create");
  const findOneUserMock = jest.spyOn(userModel, "findOne");
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

  beforeEach(() => {
    findOneUserMock.mockClear();
    createHoardingMock.mockClear();
  });
  describe("testing the route access for different users", () => {
    test("should return error if customer try to access the route", async () => {
      const response = await makeCall({}, customerToken);
      const data = response.body;
      expect(data).toHaveProperty("message");
      expect(data.message).toBe("you do not have access to this resource");
    });
    test("should allow owner to crate hoarding", async () => {
      const response = await makeCall({}, ownerToken);
      const data = response.body;
      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(6);
    });
    test("should allow seller to create hoarding", async () => {
      const response = await makeCall({}, sellerToken);
      const data = response.body;

      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(6);
    });
    test("should allow admin to crate hoarding", async () => {
      const response = await makeCall({}, adminToken);
      const data = response.body;
      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(6);
    });
  });
  describe("testing the validation of add hoarding route", () => {
    test("should fail if we send empty payload", async () => {
      const response = await makeCall({}, ownerToken);
      const responseData = response.body;
      expect(responseData).toEqual(expect.any(Array));
      expect(response.status).toBe(400);
      expect(responseData.length).toBe(6);
      expect(responseData[0]).toEqual({ message: "name field is empty" });
      expect(responseData[1]).toEqual({ message: "width field is empty" });
      expect(responseData[2]).toEqual({ message: "height field is empty" });
      expect(responseData[3]).toEqual({ message: "address field is empty" });
      expect(responseData[4]).toEqual({ message: "price field is empty" });
      expect(responseData[5]).toEqual({ message: "category field is empty" });
    });
    test("should return error if we miss some fields", async () => {
      const response = await makeCall(
        { name: "hoarding1", width: 80, height: 80 },
        ownerToken
      );
      const responseData = response.body;
      expect(responseData).toEqual(expect.any(Array));
      expect(response.status).toBe(400);
      expect(responseData.length).toBe(3);
      expect(responseData[0]).toEqual({ message: "address field is empty" });
      expect(responseData[1]).toEqual({ message: "price field is empty" });
      expect(responseData[2]).toEqual({ message: "category field is empty" });
    });
    test("should return error if we miss name , height fields", async () => {
      const response = await makeCall(
        { address: "22-7-2,hyderabad", price: 38, category: "street" },
        ownerToken
      );
      const responseData = response.body;
      expect(responseData).toEqual(expect.any(Array));
      expect(response.status).toBe(400);
      expect(responseData.length).toBe(3);
      expect(responseData[0]).toEqual({ message: "name field is empty" });
      expect(responseData[1]).toEqual({ message: "width field is empty" });
      expect(responseData[2]).toEqual({ message: "height field is empty" });
    });
    test("should fail if we send incorrect type of data", async () => {
      const payload = {
        name: 11,
        width: 83,
        height: 83,
        category: 11,
        price: "dlfdlk",
        address: "H.No: 83-2/9 ,kukatpally , hyderabad",
      };
      const response = await makeCall(payload, ownerToken);
      const responseData = response.body;

      expect(responseData[0]).toEqual({ message: "name is not a string" });
      expect(responseData[1]).toEqual({ message: "price is not a number" });
    });
    test("should fail if we send non alphaNumeric values to price,height,latitude,longitude,width", async () => {
      const payload = {
        name: "hoarding1",
        width: "abc",
        height: "ls",
        category: "street",
        price: "dlfdlk",
        address: "H.No: 83-2/9 ,kukatpally , hyderabad",
        latitude: "lsle",
        longitude: "eeok",
      };
      const response = await makeCall(payload, ownerToken);
      const responseData = response.body;
      expect(responseData[0]).toEqual({ message: "width is not a number" });
      expect(responseData[1]).toEqual({ message: "height is not a number" });
      expect(responseData[2]).toEqual({ message: "price is not a number" });
      expect(responseData[3]).toEqual({ message: "latitude is not a number" });
      expect(responseData[4]).toEqual({
        message: "longitude is not a valid number",
      });
    });
    test("should fail if features field is not an array", async () => {
      const payload = {
        name: "hoarding1",
        width: "12",
        height: "35",
        category: "street",
        price: "953.25",
        address: "H.No: 83-2/9 ,kukatpally , hyderabad",
        features: "feature1  feature2",
      };
      const response = await makeCall(payload, ownerToken);
      const responseData = response.body;
      expect(response.status).toBe(400);
      expect(responseData[0]).toEqual({ message: "features is not a array" });
    });
    test("should call the controller function if we send correct payload", async () => {
      const payload = {
        name: "hoarding1",
        width: 83,
        height: 83,
        category: "street",
        price: "623",
        longitude: 17.45,
        latitude: 75.672,
        address: "H.No: 83-2/9 ,kukatpally , hyderabad",
      };

      const response = await makeCall(payload, ownerToken);
      const responseData = response.body;
      expect(response.status).toBe(201);
      expect(responseData).toHaveProperty("message");
      expect(responseData.message).toBe("hoarding created successfully");
      // got error from controller function means it it validated successfully
      await hoardingModel.deleteOne({ _id: responseData.data._id });
    });
  });
  describe("testing the functionality of add hoarding route", () => {
    test("if user is admin or seller he shoulld provide hoardingowner field", async () => {
      const payload = {
        name: "hoarding1",
        width: 83,
        height: 83,
        category: "street",
        price: "623",
        address: "H.No: 83-2/9 ,kukatpally , hyderabad",
      };
      const response = await makeCall(payload, adminToken);
      const responseData = response.body;
      console.log(responseData);
      expect(response.status).toBe(400);
      expect(responseData).toHaveProperty("message");
      expect(responseData.message).toBe("hoarding owner field cannot be empty");
    });
    test("should return error if  provided owner doesn't exists", async () => {
      const payload = {
        name: "hoarding1",
        width: 83,
        height: 83,
        category: "street",
        price: "623",
        address: "H.No: 83-2/9 ,kukatpally , hyderabad",
        hoardingOwner: "507f1f77bcf86cd799439011",
      };
      const response = await makeCall(payload, adminToken);
      const responseData = response.body;
      expect(response.status).toBe(400);
      expect(responseData).toHaveProperty("message");
      expect(responseData.message).toBe("Provided hoarding owner not found");
    });
    test("should create owner hoarding ", async () => {
      const payload = {
        name: "hoarding1",
        width: 83,
        height: 83,
        category: "street",
        price: "623",
        longitude: 17.45,
        latitude: 75.672,
        address: "H.No: 83-2/9 ,kukatpally , hyderabad",
        hoardingOwner: owner._id,
      };

      const response = await makeCall(payload, adminToken);
      const responseData = response.body;
      console.log(responseData);
      expect(response.status).toBe(201);
      expect(responseData).toHaveProperty("message");
      expect(responseData).toHaveProperty("data");
      expect(responseData.message).toBe("hoarding created successfully");
      const hoarding = responseData.data;
      expect(hoarding.name).toBe(payload.name);
      expect(hoarding.dimension.width).toBe(payload.width.toString());
      expect(hoarding.category).toBe(payload.category);
      expect(hoarding.location.address).toBe(payload.address);
      const hoardingOwner = await userModel.findOne(
        { _id: payload.hoardingOwner },
        { fullName: 1 }
      );
      expect(hoardingOwner).toBeDefined();
      await hoardingModel.deleteOne({ _id: hoarding._id });
    });
  });
});

async function makeCall(data: object, token: string) {
  const URL = "/api/hoarding/";
  const response = await request(app)
    .post(URL)
    .set("authorization", token)
    .send(data);
  return response;
}
