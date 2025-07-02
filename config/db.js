// config/db.js

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables


export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('❌ MONGO_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const dbName = conn.connection.name;
    const dbHost = conn.connection.host;

    console.log(`✅ MongoDB Connected`);
    console.log(`   ➤ Host: ${dbHost}`);
    console.log(`   ➤ Database: ${dbName}`);
  } catch (err) {
    console.error(`❌ MongoDB Connection Failed: ${err.message}`);
    process.exit(1);
  }
};
