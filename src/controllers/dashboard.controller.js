import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
//import { like } from "../models/like.model.js";
import { ApiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { video } from "../models/video.model.js";
import {user} from "../models/user.model.js"



const getchannelstats = asyncHandler(async (req,res) => {
     const userId = req.User._id;

     const responce = await user.aggregate([
         {
             $match: {
                 _id: new mongoose.Types.ObjectId(userId),
             },
         },
         {
             $project: {
                 fullname: 1,
                 username: 1,
                 avatar: 1,
             },
         },
         {
             $lookup: {
                 from: "videos",
                 localField: "_id",
                 foreignField: "owner",
                 as: "videoInfo",
                 pipeline: [
                     {
                         $group: {
                             _id: "",
                             views: { $sum: "$views" },
                         },
                     },
                     {
                         $project: {
                             _id: 0,
                             views: "$views",
                         },
                     },
                 ],
             },
         },
         {
             $addFields: {
                 videoInfo: {
                     $first: "$videoInfo",
                 },
             },
         },
         {
             $lookup: {
                 from: "subscriptions",
                 localField: "_id",
                 foreignField: "channel",
                 as: "subsInfo",
             },
         },
         {
             $addFields: {
                 subsInfo: { $size: "$subsInfo" },
             },
         },
      
     ]);
 
     if (!responce) {
     
         throw new ApiError(
             500,
             "Something went wrong while fetching dashboard data !"
         );
     }
 
     return res
         .status(200)
         .json(new apiResponse(200, responce, "Fetched user dashboard data !"));
})



const getchannelVideos = asyncHandler(async (req,res) => {

     const userId = req.User._id;


     const response = await video.aggregate([
          {
               $match :{
                  owner : new mongoose.Types.ObjectId(userId)
               }
          },
          {
               $lookup : {
                    from : "likes",
                    localField : "_id",
                    foreignField : "video",
                    as : "likes"
               }
          }, 
          {
               $project : {
                    videoFile : 1,
                    thumbnail : 1,
                    title : 1,
                    description : 1,
                    createdAt: 1,
                    isPublished : 1,
                    owner : 1,
                    likes : {$size : "$likes"}
               }
          }, {
               $group : {
                    _id : null,
                    totalLikes : {$sum : "$likes"},
                    vidoes : {
                         $push : {
                              _id : "$_id",
                              videoFile : "$videoFile",
                              thumbnail : "$thumbnail",
                              title : "$title",
                              description : "$description",
                              createdAt: "$createdAt",
                              isPublished : "$isPublished",
                              owner : "$owner",
                              likes  : "$likes"

                         }
                    }
               }
          }
     ])

     if(!response){
          throw new ApiError(
               "Something went wrong while getting videos in dashboard !"
           );
     }

     return res
     .status(200)
     .json(
         new apiResponse(
             200,
             response,
             "Succesfullt fetched videos and likes."
         )
     );
})


export {
    getchannelVideos,
    getchannelstats
}