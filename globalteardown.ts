import { config } from "dotenv";
config();
import testDb from "./src/Config/testDb";
module.exports = async () => {
  try {
    // const db = new testDb();
    // await db.connect();
    // await db.clearDb();
    // await db.disconnect();
  } catch (err) {
    console.log(err);
    return err;
  }
};
