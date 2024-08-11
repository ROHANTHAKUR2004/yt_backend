import mongoose, { Schema } from "mongoose";


const subscriptionschema = new Schema({

    subscriber :{
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    channels : {
        type : Schema.Types.ObjectId,
        ref : "User"
    }

},
 {timestamps: true});


export const subscription =  mongoose.model("subscription", subscriptionschema)