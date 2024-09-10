import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import {comment} from "../models/comment.model.js";

const getvideoComments = asyncHandler(async (req,res) => {
      const {videoId} = req.params;
      const {page = 1, limit = 10} = req.query;

      let getallcomments;
      try {
          getallcomments = comment.aggregate([
            {
                $match :{
                    video : new mongoose.Types.ObjectId(videoId)
                }
            }, 
            {
                $lookup : {
                    from : "users",
                    localField : "owner",
                    foreignField : "_id",
                    as : "details",
                    pipeline : [
                        {
                            $project : {
                                fullname : 1,
                                avatar : 1,
                                username : 1,
                            }
                        }
                    ]
                }
            },
            {
                $lookup :{
                    from : "likes",
                    localField : "owner",
                    foreignField : "likedby",
                    as : "likes",
                    pipeline : [
                        {
                            $match : {
                                comment : {$exists : true}
                            }
                        }
                    ]
                }
            },
            {
                $addFields : {
                    details : {
                        $first : "$details"
                    }
                }
            }, 
            {
                $addFields : {
                    likes : {$size : '$likes'}
                }
            },
             {
                $skip : (page -1) *limit
            },
            {
                $limit : parseInt(limit),
            }
          ]
        )
      } 
      catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while fetching Comments !!"
        );
     }
     const response = await comment.aggregatePaginate(getallcomments , {page, limit})

       return res
       .status(200)
       .json(
        new apiResponse (200, response.docs, "comment fetched sucesfully")
       )
     
})

const addcomment = asyncHandler(async (req,res) => {

    const {videoId} = req.params
    const {content} = req.body
    if(!isValidObjectId(videoId)){
        throw new ApiError(401, "Invalid videoID")
    }

    const response = await comment.create(
        {
            content,
            video : videoId,
            owner : req.User?._id
        }
    )
    if(!response){
        throw new ApiError(400, "Something went wrong while adding comment.")
    }

    return res
    .status(200)
    .json(
        new apiResponse (
            200,
            response,
            "sucesfully created comment"
        )
    )
})

const updatecomment = asyncHandler(async (req, res) => {
   
    const {commentId} = req.params;
    const {content} = req.body;

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentID")
    }

    const responce = await  comment.findByIdAndUpdate(commentId,
        {
            content
        },
        {new: true}
    )

    if(!responce) {
        throw new ApiError(400, "Something went wrong while updating comment.")
    }

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            responce,
            "Succesfully Updated comment."
        )
    )
})

const deletecomment = asyncHandler(async (req,res) => {
    const {commentId} = req.params;

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentID")
    }

    const responce = await  comment.findByIdAndDelete(commentId)

    if(!responce) {
        throw new ApiError(400, "Something went wrong while Deleting comment.")
    }

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            responce,
            "Succesfully deleted comment."
        )
    )
})

export {
    addcomment,
    getvideoComments,
    updatecomment,
    deletecomment
}