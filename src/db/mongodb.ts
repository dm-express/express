// Mongodb: NoSQL db without tables, relations ( One to Many / Many to Many ), JOINs. Its stores data in document which is a JSON (BSON)
// SQL you CRUD on entry in the table
// SQL Eg: Add a new row with this data, update, delete, get data from a row matching this primary id

// MongoDB: Collections -> Documents -> Any Random Data (JSON)
// SQL: Tables -> Rows -> Data is structured

// To update any table in SQL further, we need to run migration scripts like flyway migration script to update the table in db

// Benefits:
// 1) No fixed Schema: you can add / remove any field in any document in any collection
// You can create new data without altering previous data
// Drawback: FE -> We create interfaces / we validate the response, if the response changes everytime it becomes difficult to validate the resposne of the api

// 2) Scaling: We can split the db in multiple servers easily
// 3) JSON format: Which is ideal for JS machines (Browsers, Servers)

// Dynomo DB AWS (NoSQL DB)

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/backend_db";

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  await mongoose.connect(MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  } as any);
  return mongoose.connection;
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}
