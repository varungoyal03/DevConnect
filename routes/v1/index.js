
import express  from "express"
const router=express.Router();
import authRouter from "./auth.js"
import profileRouter from "./profile.js";
import requestRouter from "./request.js";
import userRouter from "./user.js";
import chatRouter from "./chat.js";

router.use('/',authRouter)
router.use("/profile",profileRouter)
router.use("/request",requestRouter)
router.use("",userRouter)
router.use("",chatRouter)

export default router
