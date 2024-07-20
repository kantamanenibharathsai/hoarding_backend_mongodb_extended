import hoardingModel from "../../Models/hoardingModel";
import { deletUserById, generateJwtToken } from "../../Libray/userLibrary";
import userModel, { userType } from "../../Models/userModel";
import { generateOwner } from "../../helpers/testUser";
import { generateHoardings } from "../../helpers/testHoardings";
import request from "supertest";
import app from "../../app";
import testDb from "../../Config/testDb";

const ownerDetails = {
  fullName: "vamshiOwner",
  email: "vamshiOwner@gmail.com",
  phNumber: "98798403",
};

describe("testing get myhoardings route", () => {
  let owner: userType;
  let ownerToken: string;
  let hoardingData: any;
  const db = new testDb();
  beforeAll(async () => {
    db.connect();
    const data = await generateOwner(ownerDetails);
    if (data) {
      ownerToken = generateJwtToken({
        email: data?.email,
        _id: data?._id,
      });
      owner = data;
    }
    let prmArr = [];
    for (let i = 0; i <= 20; i++) {
      prmArr.push(
        generateHoardings({ ownerId: owner._id, hName: `hoarding${i}` })
      );
    }
    hoardingData = await Promise.all(prmArr);
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

  describe("testing functionality of the myhoarding route", () => {
    it("should return the users hoading", async () => {
      const response = await makeCall(ownerToken);
      const responseData = response.body;
      expect(response.status).toBe(200);
      expect(responseData.data).toEqual(expect.any(Array));
      expect(responseData.data.length).toBe(10);
    });
    it("should only 10 documents if we do not provide limit ", async () => {
      const response = await makeCall(ownerToken);
      const responseData = response.body;

      expect(responseData.data).toEqual(expect.any(Array));

      expect(responseData.data.length).toBe(10);
    });
    it("should return the specified number of documents --> return only 5 docs", async () => {
      const response = await makeCall(ownerToken, 5);
      const responseData = response.body;
      expect(responseData.data).toEqual(expect.any(Array));
      expect(responseData.data.length).toBe(5);
    });
    it("should return the specified number of documents --> return only 7 docs", async () => {
      const response = await makeCall(ownerToken, 7);
      const responseData = response.body;
      expect(responseData.data).toEqual(expect.any(Array));
      expect(responseData.data.length).toBe(7);
    });
  });
});

async function makeCall(token: string, limit: number = 10, page: number = 1) {
  const URL = `/api/hoarding/myHoardings/?page=${page}&limit=${limit}`;
  const response = await request(app).get(URL).set("authorization", token);

  return response;
}
