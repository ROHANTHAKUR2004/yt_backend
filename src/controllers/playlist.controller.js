
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
})

const getplaylistbyId = asyncHandler(async (req,res) => {
    const {playlistId} = req.params
})

const addVideotoplaylist = asyncHandler(async (req,res) => {
    const {playlistId, videoId} = req.params;
    if(isValidObjectId(!playlistId) && isValidObjectId(!videoId) ){
        throw new ApiError(401, "playlist id and videoid  required")
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
})

const deleteplaylist = asyncHandler(async (req,res) => {
    const {playlistId} = req.params
})

const updateplaylist = asyncHandler(async (req,res) => {
    const {playlistId} = req.params
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