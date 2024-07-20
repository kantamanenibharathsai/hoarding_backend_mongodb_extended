import hoardingModel, { hoardingType } from "../../Models/hoardingModel";
import { deletUserById, generateJwtToken } from "../../Libray/userLibrary";
import userModel, { userType } from "../../Models/userModel";
import { generateOwner } from "../../helpers/testUser";
import { generateHoardings } from "../../helpers/testHoardings";
import request from "supertest";
import app from "../../app";
import { AnyExpression, Document } from "mongoose";
import testDb from "../../Config/testDb";

const ownerDetails = {
  fullName: "vamshiOwner",
  email: "vamshiOwner@gmail.com",
  phNumber: "98798403",
};

describe("testing get myhoardings route", () => {
  let owner: userType;
  let ownerToken: string;
  let hoardingData: any = [];
  const db = new testDb();
  beforeAll(async () => {
    await db.connect();
    const data = await generateOwner(ownerDetails);
    if (data) {
      ownerToken = generateJwtToken({
        email: data?.email,
        _id: data?._id,
      });
      owner = data;
    }
    for (let i = 0; i <= 5; i++) {
      const data = await generateHoardings({
        ownerId: owner._id,
        hName: `hoarding${i}`,
      });
      hoardingData.push(data);
    }
  });
  afterAll(async () => {
    let prmArr: any = [];
    hoardingData.map((hoard: any) => {
      return hoardingModel.deleteOne({ _id: hoard._id });
    });
    prmArr.push(userModel.deleteOne({ _id: owner._id }));
    await Promise.all(prmArr);
    await db.disconnect();
  });

  describe("testing the validations of the getHoarding route", () => {
    it("should fail if we provide invalid id", async () => {
      const response = await makeCall(ownerToken, "1");
      const responseData = response.body;
      expect(responseData).toEqual(expect.any(Array));
      expect(responseData.length).toBe(1);
      expect(responseData[0]).toHaveProperty("message");
      expect(responseData[0].message).toBe(
        "objectId is not a valid document object id"
      );
    });
  });
  it("should  return hoarding if we provide correct id", async () => {
    const response = await makeCall(ownerToken, hoardingData[0]._id.toString());
    const responseData = response.body;

    expect(responseData).toHaveProperty("data");
    expect(responseData.data.hoarding._id.toString()).toEqual(
      hoardingData[0]._id.toString()
    );
    expect(responseData.data.hoarding.name).toEqual(hoardingData[0].name);
  });
  it("should  return error if document doesn't found in db with correspondig id", async () => {
    let objId = "507f1f77bcf86cd799439011";
    const response = await makeCall(ownerToken, objId);
    const responseData = response.body;
    expect(response.status).toBe(404);
    expect(responseData).toHaveProperty("message");
    expect(responseData.message).toBe(
      "hoarding is not found with corresponding id"
    );
  });
});

async function makeCall(token: string, id: string) {
  const URL = `/api/hoarding/${id}`;

  const response = await request(app).get(URL).set("authorization", token);

  return response;
}
