import express from "express"
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors"
import v1Routes from "./routes/v1/index.js"

import { connectDB } from "./config/db.js";
import { createServer } from "http";
import initializeSocket from "./utils/socket.js";




dotenv.config()

const app=express();

app.use(cors({
  origin:[ "http://localhost:5173", "https://codersconnect.vercel.app" ] , // must be exact, not '*'
  credentials: true                 // ⬅️ allow cookies / auth headers
}));


app.use(express.json());
app.use(cookieParser());

app.use("/api/v1",v1Routes)



  
  // Default route
   app.use('/', (req, res) => {
    res.send('This is the default route');
  });
  
  //global Error handller
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal server error');
  });



  const server=createServer(app);
console.log("Before socket init");
initializeSocket(server);
console.log("After socket init");


  const PORT = process.env.PORT || 4000;
  // ✅ Start server only if DB connects
  connectDB()
  .then(() => {
    console.log("✅ Database connection established...");
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1); })

