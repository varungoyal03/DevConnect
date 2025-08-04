import { Server } from "socket.io"
import crypto from "crypto"
import { Chat } from "../models/chat.js";
import jwt from "jsonwebtoken";
import cookie from "cookie"; // 👈 To parse cookies
import { isConnectionAccepted } from "./checkConnection.js";
import User from "../models/User.schema.js";
import mongoose from "mongoose";


const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("$"))
    .digest("hex");
};

const initializeSocket=(server)=>{
    console.log("running")
    const io=new Server(server,{
        cors: {
      origin: ["http://localhost:5173", "https://codersconnect.vercel.app"],
      credentials: true // ✅ Add this if you're using cookies
    }
       
    })

    //AUTH MIDDLEWATRE
    io.use(async (socket, next) => {
  try {
    const cookies = socket.handshake.headers.cookie;
    if (!cookies) throw new Error("No cookies");

    const parsedCookies = cookie.parse(cookies);
    const token = parsedCookies.token;
    if (!token) throw new Error("Token missing");


    const decoded = jwt.verify(token, process.env.JWT_SECRET);

const user = await User.findById(decoded._id).select("firstName lastName");

if (!user) throw new Error("User not found");

socket.user = {
  _id: user._id.toString(),
  firstName: user.firstName,
  lastName: user.lastName,
};


    next();
  } catch (err) {
    console.log("Auth Error:", err.message);
        return next(new Error("Authentication failed")); // ✅ disconnect socket on failure
   
  }
});


    io.on("connection",(socket)=>{
          const { _id: userId, firstName, lastName } = socket.user;
          console.log(socket.user)

        socket.on("joinChat", async ({targetUserId})=>{
          try {
        const isFriend = await isConnectionAccepted(userId, targetUserId);
        if (!isFriend) {
          return socket.emit("unauthorized", { message: "Not connected." });
        }

        const roomId = getSecretRoomId(userId, targetUserId);
        console.log(`${firstName} joined Room: ${roomId}`);
        socket.join(roomId);
      } catch (err) {
        console.error("JoinChat Error:", err.message);
      }


        });




        socket.on("sendMessage",async ({targetUserId,text})=>{

 try {

        const isFriend = await isConnectionAccepted(userId, targetUserId);
        if (!isFriend) {
          return socket.emit("unauthorized", { message: "Not connected." });
        }
       
          const roomId = getSecretRoomId(userId, targetUserId);
          
     

          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: userId,
            text,
              createdAt: new Date(),
  _id: new mongoose.Types.ObjectId(),
          });

      

          await chat.save();

       io.to(roomId).emit("messageReceived" ,{firstName,lastName,user1:userId,user2:targetUserId,text})


        } catch (err) {
          console.log(err);
        }





   
        });

        socket.on("disconnect",()=>{});

    })
}

export default initializeSocket;