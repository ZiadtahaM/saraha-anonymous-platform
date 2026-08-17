import mongoose from "mongoose";
const msgschema=new mongoose.Schema({
    content:{
        type:String,
        required:true
    },
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
})