import mongoose from "mongoose";
import connectDb from "./dbConfig";

export default class testDb {
  db: typeof mongoose | null;
  constructor() {
    this.db = null;
  }
  async connect() {
    try {
      this.db = await connectDb();
    } catch (err) {
      return Promise.resolve(err);
    }
  }

  async disconnect() {
    if (this.db !== null) {
      this.db.disconnect();
    }
  }
  async clearDb() {
    if (this.db !== null) {
      await this.db.connection.dropDatabase();
    }
  }
}
