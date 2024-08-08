import mongoose, { Schema } from "mongoose";


const userSchema = new Schema ({
    username :{
        type: String,
        required : true,
        unique : true,
        lowercase: true,
        trim : true,
        index : true
    },
    email : {
        type: String,
        required : true,
        unique : true,
        lowercase: true,
        trim : true,
    },
    fullname :{
        type: String,
        required : true,
        trim : true,
        index : true
    },
    avatar : {
        type : String,
        required : true,
    },
    coverImage : {
        type : String,
    },
    watchHistroy: [
        {
           type : Schema.Types.ObjectId,
           ref : "Video"
        }
    ],
    password:{
        type : String,
        required : [true, 'Password required']
    },
    refershToken :{
         type: String

    }
},{
    timestamps: true
})


userSchema.pre("save", async function (next) {
     
})


 export const user = mongoose.model("User", userSchema)