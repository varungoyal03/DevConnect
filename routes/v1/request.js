import express from "express";

import { userAuth } from "../../middlewares/auth.js";
import ConnectionRequest from "../../models/connectionRequest.schema.js";
import { onlineUsers } from "../../utils/onlineUsers.js";
import User from "../../models/User.schema.js";
const requestRouter = express.Router();

requestRouter.post("/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    const allowedStatus = ["ignored", "interested"];
    if (!allowedStatus.includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status type: " + status });
    }

    if (!toUserId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid request ID " });
    }

    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });
    if (existingConnectionRequest) {
      return res
        .status(400)
        .send({ message: "Connection Request Already Exists!!" });
    }

    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    const data = await connectionRequest.save();

    res.json({
      message: `Connection request ${status} sent successfully`,
      data,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

requestRouter.post("/review/:status/:requestId", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { status, requestId } = req.params;

    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ messaage: "Status not allowed!" });
    }
    if (!requestId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid request ID " });
    }

    // Find and update connection request in one operation
    const connectionRequest = await ConnectionRequest.findOneAndUpdate(
      {
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      },
      { status },
      { new: true } // Return updated document
    );

    if (!connectionRequest) {
      return res
        .status(404)
        .json({ message: "Connection request not found or already processed" });
    }

    // 🔁 Broadcast SSE only on acceptance
    if (status === "accepted") {
      const fromId = connectionRequest.fromUserId.toString();
      const toId = connectionRequest.toUserId.toString();

      // Fetch both user details from DB
      const [fromUserDoc, toUserDoc] = await Promise.all([
        User.findById(fromId).select("firstName lastName photoUrl"),
        User.findById(toId).select("firstName lastName photoUrl"),
      ]);

      const fromUser = onlineUsers.get(fromId);
      const toUser = onlineUsers.get(toId);

      // Notify the fromUser (original sender)
      if (fromUser && toUserDoc) {
        const payload = {
          userId: toId,
          name: toUserDoc.firstName + " " + toUserDoc.lastName,
          photoUrl: toUserDoc.photoUrl,
        };
        fromUser.res.write(
          `event: connection-accepted\ndata: ${JSON.stringify(payload)}\n\n`
        );
      }

      // Notify the toUser (accepting user)
      if (toUser && fromUserDoc) {
        const payload = {
          userId: fromId,
          name: fromUserDoc.firstName + " " + fromUserDoc.lastName,
          photoUrl: fromUserDoc.photoUrl,
        };
        console.log("auto called",toUser)
        toUser.res.write(
          `event: connection-accepted\ndata: ${JSON.stringify(payload)}\n\n`
        );
      }
    }

    
    res.json({
      message: "Connection request " + status,
      data: connectionRequest,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send("ERROR: " + err.message);
  }
});

export default requestRouter;
