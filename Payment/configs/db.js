import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const mongo = process.env.MONGO;

export default async () => {
  try {
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(mongo);
    console.log("MongoDB Connected: " + conn.connection.host);
  } catch (err) {
    console.log(err);
  }
};
