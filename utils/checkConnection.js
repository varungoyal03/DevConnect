import ConnectionRequest from "../models/connectionRequest.schema.js";

export const isConnectionAccepted = async (userId1, userId2) => {
  const connection = await ConnectionRequest.findOne({
    $or: [
      { fromUserId: userId1, toUserId: userId2 },
      { fromUserId: userId2, toUserId: userId1 }
    ],
    status: "accepted"
  });

  return !!connection;
};
