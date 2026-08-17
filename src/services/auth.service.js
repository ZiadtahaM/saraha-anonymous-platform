import { User } from "../db/models/usermodel.js"; // Fixed missing file extension
import { hashSync } from "bcrypt"; // Fixed incorrect import name
import { encryptPhone } from "../utils/crypto/encryption.js"; // Added .js extension
import { sendemailservice } from "./sendemailservices.js";
import path from "path";
import jwt from "jsonwebtoken";
export const signupserv = async (req, res, next) => {
    try {
        const { username, confpass, email, phone, password, gender, DOB,privateaccount  } = req.body; // Changed 'private' to 'isPublic'

        // Validate password match
        if (password !== confpass) {
            return res.status(400).json({ message: "Password and confirmation do not match" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Hash password
        const saltRounds = parseInt(process.env.saltRounds) || 12;
        const hashedpass = hashSync(password, saltRounds);
        
        // Encrypt phone
        const encryptedPhone = encryptPhone(phone,process.env.phonesecret ); 
//ispublic
const isPublic=privateaccount?false:true
      



const otp=Math.floor(10000+Math.random()*10000000).toString()
const hashedotp=hashSync(otp, process.env.saltRounds)

//send verfication 
const isemailsent=await sendemailservice({
    to:email,
    subject:"Verification",
    html:`<h1>your otp is ${otp}</h1>`,
    attachments:[{
        filename: "Screenshot 2023-11-30 182508.png",
        path: path.resolve('assets/Screenshot 2023-11-30 182508.png'),
     
    }]
})
if (!isemailsent) {
    return res.status(500).json({ message: "Failed to send verification email" });
}

const newUser = await User.create({
            username,
            email,
            password: hashedpass,
            phone: encryptedPhone,
            gender,
            DOB,
            privateaccount
        });
const generateusertoken =(id)=>{
    return jwt.sign({id :newUser._id},process.env.JWT_SECRET,{expiresIn:"1h"})
}
        
        res.status(201).json({
            message: "User created successfully",
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });

    } catch (error) {
        next(error); 
    }
};