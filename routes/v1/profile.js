
import express from "express"
const profileRouter=express.Router();
import { userAuth } from "../../middlewares/auth.js";
import { sanitizeUser } from "../../utils/sanitizeUser.js";
import { validateEditProfileData } from "../../utils/validation.js";



profileRouter.get("/view", userAuth, async (req, res) => {
    try {
      const user = req.user;
  
      return res.status(200).json({
        message: "Profile fetched successfully",
        data: sanitizeUser(user),
      });
    } catch (err) {
      return res.status(500).json({
        error: "Internal server error",
        message: err.message,
      });
    }
  });

profileRouter.patch("/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit Request");
    }

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();

   
    return res.status(200).json({
        message: `${loggedInUser.firstName}, your profile was updated successfully`,
        data: sanitizeUser(loggedInUser),
      });
    } catch (err) {
      return res.status(400).json({
        error: "Profile update failed",
        message: err.message,
      });
    }
  });

export default profileRouter