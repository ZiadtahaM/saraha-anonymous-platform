import {v2 as cloudinaryv2} from 'cloudinary'
export const cloud=()=>{
    cloudinaryv2.config({
        cloud_name:process.env.CLOUD_NAME ,
        api_key:process.env.API_KEY ,
        api_secret:process.env.API_SECRET
    })
    return cloudinaryv2
}