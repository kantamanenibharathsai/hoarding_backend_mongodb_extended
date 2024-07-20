import hoardingModel from "../../Models/hoardingModel";
import { deletUserById, generateJwtToken } from "../../Libray/userLibrary";
import userModel, { userType } from "../../Models/userModel";
import { generateOwner } from "../../helpers/testUser";
import { generateHoardings } from "../../helpers/testHoardings";
import request from "supertest";
import { createHoarding } from "../../Libray/hoardingLibrary";
import app from "../../app";
import testDb from "../../Config/testDb";

const ownerDetails = {
  fullName: "vamshiOwner",
  email: "vamshiOwner@gmail.com",
  phNumber: "98798403",
};

describe("testing remove hoarding route", () => {
  let owner: userType;
  let ownerToken: string;
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
  });
  afterAll(async () => {
    let prmArr: any = [];

    prmArr.push(userModel.deleteOne({ _id: owner._id }));
    await Promise.all(prmArr);
    await db.disconnect();
  });

  describe("testing remove hoarding route", () => {
    it("should fail if we provide invalid id", async () => {
      const response = await makeCall(ownerToken, "1");
      const responseData = response.body;
      expect(responseData).toEqual(expect.any(Array));
      expect(responseData.length).toBe(1);
      expect(responseData[0]).toHaveProperty("message");
      expect(responseData[0].message).toBe("id is not a valid ObjectId");
    });
    it("should fail if hoarding not found in the db", async () => {
      let objId = "507f1f77bcf86cd799439011";
      const response = await makeCall(ownerToken, objId);

      const responseData = response.body;

      expect(responseData).toHaveProperty("message");
      expect(responseData.message).toBe(
        "hoarding not found with corresponding id"
      );
    });
    it("should remove hoarding from the db", async () => {
      const hoarding = await createHoarding({
        name: "hoarding11",
        owner: owner._id,
        location: {
          address: "",
          geoLocation: {
            type: "Point",
            coordinates: [27.39, 72.8],
          },
        },
      });
      const response = await makeCall(ownerToken, hoarding._id.toString());

      const responseData = response.body;

      expect(responseData).toHaveProperty("message");
      expect(responseData.message).toBe("hoarding deleted successfully");
      const hoardingdoc = await hoardingModel.findOne({
        _id: hoarding._id.toString(),
      });
      expect(hoardingdoc).toBeDefined();
    });
    it("if the user is owner and should fail to delete the hoarding if it does'nt belong to him", async () => {
      let objId = "507f1f77bcf86cd799439011";
      const hoarding = await createHoarding({
        name: "hoarding11",
        owner: objId,
        location: {
          address: "",
          geoLocation: {
            type: "Point",
            coordinates: [27.39, 72.8],
          },
        },
      });
      const response = await makeCall(ownerToken, hoarding._id.toString());

      const responseData = response.body;
      expect(responseData).toHaveProperty("message");
      expect(responseData.message).toBe(
        "you cannot delete this hoarding as you are not the owener of this hoarding"
      );
      await hoardingModel.deleteOne({ _id: hoarding._id });
    });
  });
});

async function makeCall(token: string, id: string) {
  const URL = `/api/hoarding/${id}`;

  const response = await request(app).delete(URL).set("authorization", token);

  return response;
}
