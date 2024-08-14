const { Schema, default: mongoose } = require("mongoose");

const playlistScehema = new Schema(
{
   name :
   {
      type : String,
      required : true
   },
   description :
   {
     type : String
   },
   videos :
    [
     {
       type : Schema.Types.ObjectId,
       ref : "Video"
     }
   ],
   owner:
   {
     type : Schema.Types.ObjectId,
     ref : "User"
   }
},
{
    timestamps: true
})

export const playlist = mongoose.model("playlist", playlistScehema)