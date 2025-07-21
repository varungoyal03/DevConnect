
import express from "express"

import { userAuth } from "../../middlewares/auth.js";
import ConnectionRequest from "../../models/connectionRequest.schema.js";
const requestRouter=express.Router();

requestRouter.post(
  "/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
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
  }
);

requestRouter.post(
  "/review/:status/:requestId",
  userAuth,
  async (req, res) => {
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

      res.json({ message: "Connection request " + status, data });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);

export default requestRouter;