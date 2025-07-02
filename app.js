import express from "express"
import dotenv from "dotenv";

import v1Routes from "./routes/v1/index.js"
import { connectDB } from "./config/db.js";


dotenv.config()

const app=express();

app.use("/api/v1",v1Routes)



  
  // Default route
   app.get('/', (req, res) => {
    res.send('This is the default route');
  });
  
  //global Error handller
  app.use('/',(err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal server error');
  });



  const PORT = process.env.PORT || 4000;
  // ✅ Start server only if DB connects
  connectDB()
  .then(() => {
    console.log("✅ Database connection established...");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1); })

