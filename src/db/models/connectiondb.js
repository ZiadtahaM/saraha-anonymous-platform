import mongoose from 'mongoose';
const connectiondb =async ()=>{
    await mongoose.connect("mongodb://127.0.0.1:27017/saraha")
    .then( ()=>{
        console.log("conectado a la base de datos")
    })
    .catch(()=>{
        console.log("error al conectarse a la base de datos",err)
        
    })
}

export default connectiondb;