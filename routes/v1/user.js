
import express from "express"
const userRouter = express.Router();
import { userAuth } from './../../middlewares/auth.js';
import User from './../../models/User.schema.js';
import ConnectionRequest from "../../models/connectionRequest.schema.js";
import { logOnlineUsers, onlineUsers } from "../../utils/onlineUsers.js";




const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

// Get all the pending connection request for the loggedIn user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);


    res.json({
      message: "Data fetched successfully",
      data: connectionRequests,
    });
  } catch (err) {
    req.statusCode(400).send("ERROR: " + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    console.log(connectionRequests);

    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({ data });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    // const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    // const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId  toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .limit(limit);

    res.json({ data: users });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});










// This SSE (/user/online-status) endpoint:

// Tracks online friends.
// Notifies friends when someone comes online/offline.
// Sends initial list of online friends when user connects.
// Cleans up when a user disconnects or refreshes.

userRouter.get("/user/online-status", userAuth, async (req, res) => {
  const userId = req.user._id.toString();

  // Set SSE headers
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // Send initial ping
  res.write("event: connected\ndata: connected\n\n");

  // Fetch this user's connections
  const connections = await ConnectionRequest.find({
    $or: [
      { fromUserId: userId, status: "accepted" },
      { toUserId: userId, status: "accepted" },
    ],
  });

  const friendIds = new Set();
  connections.forEach((conn) => {
    const fid =
      conn.fromUserId.toString() === userId
        ? conn.toUserId.toString()
        : conn.fromUserId.toString();
    friendIds.add(fid);
  });

  // Save to onlineUsers map
  onlineUsers.set(userId, {
    res,
    friends: friendIds,
  });

  logOnlineUsers();

// simplified symmetric logic
for (const fid of friendIds) {
  const friendObj = onlineUsers.get(fid);
  if (friendObj) {
    // notify friend about me
    friendObj.res.write(`event: friend-online\ndata: ${JSON.stringify({ userId })}\n\n`);

    // notify me about friend
    res.write(`event: friend-online\ndata: ${JSON.stringify({ userId: fid })}\n\n`);
  }
}



  // Send back to this user the list of friends who are currently online
  // const onlineFriends = [];
  // for (const [fid, friendObj] of onlineUsers) {
  //   if (friendIds.has(fid)) {
  //     onlineFriends.push(fid);
  //   }
  // }

  // res.write(`event: initial-online-friends\ndata: ${JSON.stringify(onlineFriends)}\n\n`);

  // Handle client disconnect
  req.on("close", () => {
    onlineUsers.delete(userId);
    // Notify friends that this user went offline
    for (const [fid, friendObj] of onlineUsers) {
      if (friendObj.friends.has(userId)) {
        friendObj.res.write(`event: friend-offline\ndata: ${JSON.stringify({ userId })}\n\n`);
      }
    }
  });
});

console.log(onlineUsers);

export default userRouter