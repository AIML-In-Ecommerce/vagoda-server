import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const mongo = process.env.MONGO;
// const mongo = "mongodb+srv://thien:thien123123@tttnpq.gd486ql.mongodb.net/"

console.log(mongo);
export default async () => {
  try {
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(mongo);
    console.log("MongoDB Connected: " + conn.connection.host);
  } catch (err) {
    console.log(err);
  }
};
