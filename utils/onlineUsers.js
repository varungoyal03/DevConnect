// onlineUsers.js
export const onlineUsers = new Map(); // userId => { res, connections, friends }

export function logOnlineUsers() {
  console.log("🟢 Current Online Users:");
  for (const [userId, value] of onlineUsers.entries()) {
    console.log(`- ${userId} | friends: ${[...value.friends].join(", ")}`);
  }
}
