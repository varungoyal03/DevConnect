import cookieParser from "cookie-parser";
import express, { application } from "express"
const router=express.Router();

router.use(express.json());
router.use(cookieParser());

export default router
