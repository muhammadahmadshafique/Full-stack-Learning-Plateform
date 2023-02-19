import express from "express"
const router= express.Router()

import {signup,signin,logout,currentUser,forgotPassword,resetPassword} from "../controllers/auth"


//Middle wares

import { requireSignin } from "../middlewares";
router.post("/signup",signup);
router.post("/signin",signin);
router.get("/logout",logout);
router.get("/current-user", requireSignin, currentUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);


module.exports=router;



