import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectdb = async () =>{
    try {
       const connectionINStance =  await mongoose.connect(`${process.env.DB_URL}/${DB_NAME}`)
       console.log(`mongodb connected  !! DBHOSt : ${connectionINStance.connection.host}` )
  
    } catch (error) {
         console.log("moongodb connection failed", error);

    }
}

export default connectdb;