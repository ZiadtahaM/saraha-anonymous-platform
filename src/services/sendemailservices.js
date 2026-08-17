import { attachment } from 'express/lib/response';
import nodemailer from 'nodemailer'
export const sendemailservice= async(
    {
        to,
        subject,
        attachments
    }
) =>{
    try {
         const transporter = nodemailer.createTransport({
          host:'smtp.gmail.com',
          port:465,
          secure:true,
          auth:{
            user:process.env.email_user,
            pass:process.env.emailpass
          }
          });

          const info = await transporter.sendMail({
            from: `"noreply" <${process.env.email_user}>`,
            to, // list of receivers
            subject,
            cc:"fagricastro@gmail.com", // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world?</b>", 
            attachments
          });
    } catch (error) {
        
    }
}