import mongoose, { isValidObjectId } from "mongoose";
import { tweet } from "../models/tweets.model";
import { ApiError } from "../utils/apiError";
import { apiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

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