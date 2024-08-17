import mongoose, { isValidObjectId } from "mongoose";
import { tweet } from "../models/tweets.model.js";
import { ApiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createtweet =  asyncHandler(async (req,res) => {
    const { content} = req.body
    if(content?.trim() === ""){
        throw new ApiError(500, "content of tweet is required")
    }
   
     const Tweet = await tweet.create({
         content : content,
         owner : req.User?._id
        })

     if(!Tweet) {
        throw new ApiError(500, "something goes wrong while creating tweet")
    }


    return res.status(200)
       .json(new apiResponse(200, Tweet, "Sucessfully created tweet" ))
})


const getusertweet =  asyncHandler(async (req,res) => {
    const {userId} = req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(500, "INvalid user id")
    }

    const Tweets = await tweet.aggregate([
        {
            $match :{
                owner : new mongoose.Types.ObjectId(`${userId}`)
            }
        }, {
            $lookup :{
                from : "users",
                localField : "owner",
                foreignField : "_id",
                as : "details",
                pipeline : [
                    {
                        $project : {
                            avatar : 1,
                            fullname : 1,
                            
                        }
                    }
                ]
            }
        },
        {
            $lookup :{
                from : "likes",
                localField : "id",
                foreignField : " tweet",
                as : "likesnum"
            }
        }, 
        {
            $addFields : {
                details : {
                    $first : "$details"
                },
                likes : {
                    $size : "$likesnum"
                }
            }
        }
    ])

    if(!Tweets.length){
        throw new ApiError(500, "tweets not found")
    }
   
    return res.status(200)
         .json(new apiResponse(200, Tweets, "tweets fetched sucessfuly"))




})






const updatetweet =  asyncHandler(async (req,res) => {
    
})




const deletetweet =  asyncHandler(async (req,res) => {
    
})


export {
    createtweet,
    getusertweet,
    updatetweet,
    deletetweet
}