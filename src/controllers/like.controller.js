import mongoose, { isValidObjectId, Model } from "mongoose";
import { like } from "../models/like.model.js";
import { comment} from "../models/comment.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { video }from "../models/video.model.js"
import {tweet} from "../models/tweets.model.js"

const togglelike = async(Model, resourceId , userId) => {

    if(!isValidObjectId(resourceId) || !isValidObjectId(userId)){
        throw new ApiError("invalid user id and resource id")
    }

    const model = Model.modelName;

    const isLiked = await like.findOne({
        [model.toLowerCase()] : resourceId,
        likedBy : userId
    });

    let response ;
    try {
        if(!isLiked){
            response = await like.create({
                [model.toLowerCase()] : resourceId,
                likedBy : userId
            })
        }
        else {
            response = await like.deleteOne({
                [model.toLowerCase()] : resourceId,
                likedBy : userId
            })
        }
    } catch (error) {
        throw new ApiError(500 , 'something wnet wrong whilr toggling like')
    }

    const totalikes = await like.countDocuments({
        [model.toLowerCase()] : resourceId,
    })
  

     return {
         response , isLiked , totalikes
     }
}


const togglevideolike = asyncHandler(async (req,res) => {
    const {videoId} = req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(401, "invalid videoid")
    }

    const {isLiked , totalikes} = await togglelike(
        video, 
        videoId,
        req.User?._id
    )


    return res
    .status(200)
    .json(new apiResponse(
        200, 
        {totalikes},
        !isLiked ? "likedSuceffully" : "liked removed sucesfully"
    ))
});

const togglecommentlike = asyncHandler(async (req,res) => {
    const {commentId} = req.params;

    if(!isValidObjectId(commentId)){
        throw new ApiError(401, "invalid commentid" )
    }

    const {response , isLiked , totalikes} = await togglelike(
          comment,
          commentId,
          req.User?._id
    )

    return res
    .status(200)
    .json(new apiResponse(
        200, 
        {totalikes},
        !isLiked ? "likedSuceffully" : "liked removed sucesfully"
    ))
})


const toggletweetlike = asyncHandler(async (req,res) => {
     const {tweetid} = req.params;

     if(!isValidObjectId(tweetid)){
        throw new ApiError(401, "invalid tweetid" )
    }
     
    const {response , isLiked , totalikes} = await togglelike(
        tweet,
        tweetid,
        req.User?._id
  )

    return res
    .status(200)
    .json(new apiResponse(
        200, 
        {totalikes},
        !isLiked ? "likedSuceffully" : "liked removed sucesfully"
    ))

})


const getvideoLikes = asyncHandler(async (req,res) => {
    const userId  =  req.User?._id;

    if(!isValidObjectId(userId)){
       throw new ApiError(401, "Invalid userID");
    }

    const likedvideo = await like.aggregate([
        {
            $match : {
                $and : [
                    {likedBy : new mongoose.Types.ObjectId(`${userId}`)},
                    {video : {$exists : true}}
                ]
            }
        },
        {
            $lookup :{
                from : "videos",
                localField : "video",
                foreignField : "_id",
                as : "video", 
                pipeline : [
                     {
                        $lookup : {
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as : "owner",
                            pipeline : [
                                {
                                    $project : {
                                        fullname : 1,
                                        username : 1,
                                        avatar : 1
                                    }
                                }
                            ]
                        }
                     }, {
                        $addFields : {
                            owner : {
                                $first : "$owner",
                            }
                        }
                     }
                ]
            }
        },
        {
            $addFields: {
                details: {
                    $first: "$video"
                }
            }    
        }
    ])


    return res.status(200)
    .json(
        new apiResponse(200, likedvideo , "sucesfully fetched liked video")
    )

})


export{
    togglecommentlike,
    toggletweetlike,
    togglevideolike,
    getvideoLikes
}
