
import express  from 'express';

import validator from 'validator';
import User from '../../models/User.schema.js';
import bcrypt from "bcrypt"
import { validateLoginData, validateSignUpData } from '../../utils/validation.js';
import { sanitizeUser } from './../../utils/sanitizeUser.js';



const authRouter=express.Router();


authRouter.post("/signup",async (req,res) => {
    try {

        validateSignUpData(req);
        
        const { firstName, lastName, emailId, password } = req.body;

        // Encrypt the password
        const passwordHash = await bcrypt.hash(password, 10);
    
    
        //   Creating a new instance of the User model
        const user = new User({
          firstName,
          lastName,
          emailId,
          password: passwordHash,
        });
    
        const savedUser = await user.save();
        const token = await savedUser.getJWT();
    
      
        res.cookie("token", token, {
            httpOnly: true, // 🔐 Prevents JavaScript access
            secure: process.env.NODE_ENV === "production", // 🔐 HTTPS-only in production
            sameSite: "none", // Optional but helpful to prevent CSRF
            expires: new Date(Date.now() + 8 * 3600000), // Optional: 8 hours
          });
          
          
    
        res.status(201).json({message: "user added", data: sanitizeUser(savedUser) });

    } catch (error) {
        res.status(500).json({error:"internal server error" , message: error.message  });
    }
})

authRouter.post("/login",async (req,res) => {

    try {

        validateLoginData(req);
        let  {emailId,password}=req.body;
        
        emailId = emailId?.trim().toLowerCase();
        
        const user = await User.findOne({ emailId: emailId });
        if (!user) {
            throw new Error("Invalid Credentials");
        }
        const isValidPassword = await user.validatePassword(password);
        if (isValidPassword) {
            const token = await user.getJWT();

            res.cookie("token", token, {
                httpOnly: true, // 🔐 Prevents JavaScript access
                secure: process.env.NODE_ENV === "production", // 🔐 HTTPS-only in production
                sameSite: "none", // Optional but helpful to prevent CSRF
                expires: new Date(Date.now() + 8 * 3600000), // Optional: 8 hours
              });
              




            res.status(200).json({message:"logged  in", data: sanitizeUser(user)});
        } else {
            throw new Error("Invalid Vredentials");
        }


    } catch (error) {
        res.status(500).json({error:"internal server error" , message: error.message  });
    }
})

authRouter.post("/logout", (req, res) => {
    res.clearCookie("token", {
      httpOnly: true,                                 // 🔐 Prevents JS access
      secure: process.env.NODE_ENV === "production",  // 🔐 HTTPS-only in production
      sameSite: "strict",                             // 🛡️ CSRF protection
    });
  
    return res.status(200).json({ message: "Logged out successfully" });
  });

  
  

export default authRouter;