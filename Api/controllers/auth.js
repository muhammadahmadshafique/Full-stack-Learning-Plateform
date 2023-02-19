import User from "../models/user"
import {hashpassword,comparepassword} from '../utils/auth'
import jwt from "jsonwebtoken"
import AWS from "aws-sdk";
import { nanoid } from 'nanoid'



const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION,
};

const SES = new AWS.SES(awsConfig);


export const signup= async (req,res)=>{
    //Get data from request
    // console.log(req.body)
    const {name,email,password}=req.body;
    try{
        //Validation
        if(!name) return res.status(400).send("Name is required");
        if(!password || password.length<6) return res.status(400).send("Password is required and should be 6 letter minimum")
        let userExist= await User.findOne({email}).exec();
        if(userExist) return res.status(400).send("Email already Taken.")
        //hashPassword 
        const Finalhashpassword= await hashpassword(password);
        //lets register 
        const user=  new User({
            name,
            email,
            password:Finalhashpassword,
        });

        await user.save()
        console.log("Saved user is", user);
        return res.status(200).json({ok:true,message:"This is a test mess"})
    }

    catch(err){
        console.log(err.message)
        return res.status(400).send("Sign Up failed! Try again")
    }
};





//Login 

export const signin= async (req,res)=>{
    try{
        // console.log(req.body)
        const { email,password}=req.body;
        //Validation 
    
        if(!password || password.length<6 ){
            return res.status(400).send("Password is required and Password Should be 6 letter minimum! ");

        }
        const user = await User.findOne({email}).exec();
        if(!user) return res.status(400).send("No user found with this email!!");
        
        //CheckPassword 
        const Matchpassword= await comparepassword(password,user.password);

        if(Matchpassword){
            //Create a signed Jwt
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
              expiresIn: "70d",
            });
            console.log(user._id)
            //Send user and jwt token to client without hashed password
            user.password=undefined;
            res.cookie("token", token, {
              httpOnly: true,
              // secure: true, // only works on https
            });
        

           res.json(user)

        }else{
            return res.status(400).send("Passowrd is incorrect");

        }
    }
    catch(err){
        console.log(err.message);
        return res.status(400).send("Error. Try Again.")
    }
};




export const logout= async(req,res)=>{
    try{
      res.clearCookie('token');
      return res.json({message:"Logout successful"})
    }catch(err){
      return res.status(400).send("Try again")   
    }
  }




  //Current User
  export const currentUser = async (req, res) => {
    try {
  
      const user = await User.findById(req.auth._id).select("-password").exec();
      // console.log("CURRENT_USER", user);
      return res.json({ ok: true });
  
    } catch (err) {
      return res.json({ Error: "Not Get current User" });
      console.log(err);
  
    }
  };


  /////////////////////////Forget Paaword
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // console.log(email);
    const shortCode = nanoid(6).toUpperCase();
    console.log(shortCode)
    const user = await User.findOneAndUpdate(
      { email },
      { passwordResetCode: shortCode }
    );
    if (!user) return res.status(400).send("User not found");

    // prepare for email
    const params = {
      Source: process.env.EMAIL_FROM,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
                <html>
                  <h1>Reset password</h1>
                  <p>User this code to reset your password</p>
                  <h2 style="color:red;">${shortCode}</h2>
                  <i>edemy.com</i>
                </html>
              `,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Reset Password",
        },
      },
    };

    const emailSent = SES.sendEmail(params).promise();
    emailSent
      .then((data) => {
        console.log(data);
        res.json({ user: true });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    // console.table({ email, code, newPassword });
    const hashedPassword = await hashpassword(newPassword);

    const user = User.findOneAndUpdate(
      {
        email,
        passwordResetCode: code,
      },
      {
        password: hashedPassword,
        passwordResetCode: "",
      }
    ).exec();
    if(user){
      res.json({ ok: "Successfully update Password" });

    }else{
      res.json({ ok: "Code is not correct" });

    }
    
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error! Try again.");
  }
};
