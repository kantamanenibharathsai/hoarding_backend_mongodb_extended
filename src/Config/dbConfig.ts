import mongoose from "mongoose";

export default async function connectDb(): Promise<typeof mongoose> {
  try {
    let dbUrl = "";
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv === "dev") {
      dbUrl = process.env.DBURL ? process.env.DBURL : "";
    } else if (nodeEnv === "test") {
      dbUrl = process.env.TESTDBURL ? process.env.TESTDBURL : "";
    }
    if (dbUrl === "") {
      return Promise.reject("please select an environment");
    }
    const mongoClient = await mongoose.connect(dbUrl, { autoIndex: false });
    console.log("connected to database successfully");
    return Promise.resolve(mongoClient);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
}
