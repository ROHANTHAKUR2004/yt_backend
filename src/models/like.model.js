const { Schema, default: mongoose } = require("mongoose");


const likeSchema = new Schema(
    {
         comment : 
         {
            type: Schema.Types.ObjectId,
            ref : "comment"
         },
         video :
         {
           type: Schema.Types.ObjectId,
            ref : "Video"
         },
         likedby :
         {
           type: Schema.Types.ObjectId,
            ref : "User"
         },
         tweet :
         {
           type: Schema.Types.ObjectId,
            ref : "tweet"
         },

    },
    {
        timestamps : true

    })

    export const like = mongoose.model("like", likeSchema)
