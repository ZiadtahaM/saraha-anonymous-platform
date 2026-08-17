import { User } from '../../db/models/user.model.js';
export const siugnup=async(req,res,next)=>{
try {
    const {name,email,password,confpass,gender,phone}=req.body 
    if(password!=confpass){
        return res.status(400).json({msg:"password and confpass not match"})
    }
    const emailexist=await User.findOne({email})
    if(emailexist){
        return res.status(400).json({msg:"email already exist"})
    }
    const phoneexist=await User.findOne({phone})
    if(phoneexist){
        return res.status(400).json({msg:"phone already exist"})
    }
    return res.status(201).json({msg:"dooone"})
    
} catch (error) {
    return res.status(500).json({msg:"errror",message:error.message ,stack:error.stack})
}


}