
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import {playlist } from '../models/playlist.model.js'
import { apiResponse } from "../utils/apiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";




const createplaylist = asyncHandler(async (req,res) => {
    const {name, description} = req.body;
    if(!name || !description){
        throw new ApiError(400, "name and desc are rerquired")
    }

    const response = await playlist.create({
       name ,
       description,
       owner : new mongoose.Types.ObjectId(`${req.User?._id}`)
    })

    if(!response){
        throw new ApiError(500, "Something went wrong while creating playlist")
    }

    return res
    .status(200)
    .json(new apiResponse(
        200,
        response,
        "playlist creaated"
    ))


})

const getuserplaylist = asyncHandler(async (req,res) => {
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(401, "invalid  required")
    }

    const response = await playlist.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(`${userId}`)
            }
        },
        {
            $lookup :{
                from :"videos",
                localField : "videos",
                foreignField : "_id",
                 as : "details", 
                 pipeline : [
                    {
                        $project : {
                            thumbnail : 1
                        }
                    }
                 ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new apiResponse(200 , response, "user palylist fetched  succesfully")
    )



})

const getplaylistbyId = asyncHandler(async (req,res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(401, "playlist id required")
    }

    const Playlist = await playlist.aggregate([
        {
            $match :{
                _id : new mongoose.Types.ObjectId(`${playlistId}`)
            }
        }, 
        {
            $lookup :{
                from : "videos",
                localField : "videos",
                foreignField : "_id",
                as : "details",
                pipeline : [{
                    $lookup : {
                        from : "users",
                        localField : "owner",
                        foreignField : "_id",
                        as : "userinfo",
                        pipeline :[
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
                    $addFields :{
                        userinfo :{
                            $first : "$userinfo"
                        }
                    }
                }
            ]
          }
        }
    ])

    if(!Playlist){
        throw new ApiError(401, "something went wrong by creating palylist")
    }

    return res.status(200)
        .json(
            new apiResponse(200,Playlist,"succesfully fetched playlist")
        )
    
})

const addVideotoplaylist = asyncHandler(async (req,res) => {
    const {playlistId, videoId} = req.params;
    if(!isValidObjectId(playlistId) && !isValidObjectId(videoId) ){
        throw new ApiError(401, "invalid playlist id and videoid  required")
    }

    const Playlist = await playlist.findById(`${playlistId}`)
    if(!Playlist){
        throw new ApiError(401, "unable to find playlists")
    }

    const response = await playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet :{
                videos : videoId
            }
        },
        {
            new : true
        }
    )

    if(!response){
        throw new ApiError(401, "unable make playlist ,something went wrong")
    }


    return res
    .status(200)
    .json(
        new apiResponse(200 , response, "video add to playlist succesfully")
    )

})

const removevideoFromplaylist = asyncHandler(async (req,res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId) && !isValidObjectId(videoId) ){
        throw new ApiError(401, "invalid playlist id and videoid  required")
    }

    const Playlist = await playlist.findById(`${playlistId}`)
    if(!Playlist){
        throw new ApiError(401, "unable to find playlists")
    }

    const response = await playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{
                videos : {
                    $in : [`${videoId}`]
                }
            }
        },
        {
            new : true
        }
    )

    if(!response){
        throw new ApiError(401, "unable removing playlist ,something went wrong")
    }


    return res
    .status(200)
    .json(
        new apiResponse(200 , response, "video removed from playlist , succesfully")
    )
})

const deleteplaylist = asyncHandler(async (req,res) => {
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "invalid playlist id")
    }

    const response = await playlist.findOneAndDelete(`${playlistId}`)
   if(!response){
       throw new ApiError(400, "something went wrong while removing palylist")
   }

   return res
   .status(200)
   .json(
       new apiResponse(200 , response, "video removed from playlist , succesfully")
   )
})

const updateplaylist = asyncHandler(async (req,res) => {
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "invalid playlist id")
    }

    const {name, description} = req.body

    if(!name && !description) {
        throw new ApiError(401, "Atleast one of the field is required.")
    }

    const Playlist = await playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description
            }
        },
        {
            new: true
        }
    )

    if(!Playlist) {
        throw new ApiError(500, "Something went wrong while updating playlist.")
    }

    return res
    .status(200)
    .json(
        new apiResponsepiResponse(200, Playlist, "Playlist updates succesfully.")
    )
})

export{
    createplaylist,
    getplaylistbyId,
    getuserplaylist,
    addVideotoplaylist,
    removevideoFromplaylist,
    deleteplaylist,
    updateplaylist
}