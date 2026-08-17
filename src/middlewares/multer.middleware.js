import multer from 'multer';
export const multermiddleware =(destinantionpath='general',allowedimagesexteinsios=[])=>{
// const destinantionfolder =`assets/${destinantionpath}`
    const storage =multer.diskStorage({

        // destination:function(req,res,cb){
        //     cb(null ,destinantionfolder)
        // },filename :function(req,file,cb){
        //     const uniquefile=date.now()+'-'+Math.round(Math.random()*1e9)
        //     cb(null,uniquefile+__+file.originalname)
        // }
})
    const filefilter=(req,file,cb)=>{
        if(allowedimagesexteinsios.includes(file.mimtype)){
            cb(null,true)
        }else{
            cb(new error("only images are allowed"),false)
        }
    }
    const upload=multer({storage})
    return upload;
}