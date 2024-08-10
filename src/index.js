import dotenv from "dotenv";
import connectdb from "./db/db.js";
import { app } from "./app.js";

dotenv.config({
    path : "./.env"
})

connectdb()
.then(() =>{
    app.listen(process.env.PORT || 8000 , () =>{
        console.log(`Server is up and running on ${process.env.PORT}`)
    })
})
.catch((err) =>{
    console.log("DB Connection failed ..");
})
