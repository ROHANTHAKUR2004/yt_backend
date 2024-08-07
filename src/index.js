import dotenv from "dotenv";
import connectdb from "./db/db.js";

dotenv.config({
    path : "./env"
})

connectdb();
