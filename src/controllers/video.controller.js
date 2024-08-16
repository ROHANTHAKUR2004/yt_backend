import { asyncHandler } from "../utils/asyncHandler.js";
import { video }from "../models/video.model.js"
import { ApiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { uploadonCLoudnary } from "../utils/cloudnary.js";
import { isValidObjectId } from "mongoose";


const getallvideo = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    try {
         const pipeline = [
            {
                $sample: { size: parseInt(limit) }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "details",
                    pipeline: [
                        {
                            $project: {
                                fullname: 1,
                                username: 1,
                                avatar: 1
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    details: { $arrayElemAt: ["$details", 0] }
                }
            }
        ];

       
        const result = await video.aggregatePaginate(video.aggregate(pipeline), { page, limit });

        if (result.docs.length === 0) {
            return res.status(200).json(new apiResponse(200, [], "no video found"));
        }

        return res.status(200).json(new apiResponse(200, result.docs, "all videos fetched successfully"));
    } catch (error) {
        console.error("Error occurred during video fetching:", error);
        throw new ApiError(500, "Something went wrong while fetching video");
    }
});


const publishVideo = asyncHandler(async (req,res) => {
    const {title , description} = req.body

    const localvideothumbnailpath = req.files?.thumbnail[0]?.path;
    const localvideofilepath = req.files?.videoFile[0]?.path;

    if(!title || !description || !localvideofilepath || !localvideothumbnailpath){
        throw new ApiError(500,  "all fileds required")
    }


    const videoFile = await uploadonCLoudnary(localvideofilepath)
    const thumbnail =  await uploadonCLoudnary(localvideothumbnailpath)

    

      if(!videoFile.url || !thumbnail.url){
        throw new ApiError(400, "erroe while uploading videofile and thumbnail")
      }

      const Video = await video.create({
        videoFile : videoFile.url,
        thumbnail : thumbnail.url,
        title: title,
        description:description,
        duration: videoFile.duration,
        isPublished: true,
        owner: req.User?._id
      })

      if(!Video){
         throw new ApiError (500, "Error while uploading video")
      }

      return res.
      status(200)
      .json(
        new apiResponse(
            200,
            Video,
            "VIdeo uploaded succesfully"
        )
      )
})


const getvideobyId = asyncHandler(async (req,res) => {
    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(500 , "Invalid video id")
    }

    const Video =  await video.findById(videoId);
    if(!Video){
        throw new ApiError(400, "video not found")
    }

    return res
    .status(200)
    .json(
        new apiResponse(
            200, 
            Video,
            "Succefully fetch video by id"
        )
    )



})

const getvideobytitle = asyncHandler(async (req, res) => {
    const { title } = req.params;
    if (!title) {
        throw new ApiError(500, "Invalid video title");
    }

    const Video = await video.findOne({ title });

    if (!Video) {
        throw new ApiError(400, "Video not found");
    }

    return res
    .status(200)
    .json(
        new apiResponse(
            200, 
            Video,
            "Successfully fetched video by title"
        )
    );
});


const updateVideo = asyncHandler(async (req,res) => {
     const {videoId} = req.params
     const { title, description } = req.body
     //TODO: update video details like title, description, thumbnail
    if(!title || !description){
        throw new ApiError(500,  "all fileds required")
    }

    const Video = await video.findByIdAndUpdate(
        videoId,
        {
            $set : {
                title : title,
                description : description
            }
        },
        {
            new : true
        }
    )

    if(!Video){
        throw new ApiError(500,  "video not found")
    }


    return res
        .status(200)
        .json(
            new apiResponse(200, Video, "Video details updated succesfully.")
        );

})

const deletedvideo = asyncHandler(async (req,res) => {
    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(500 , "Invalid video id")
    }

    const deleteVideo = await video.deleteOne({
       _id : Object(`${videoId}`)
    })
  
    if(!deleteVideo){
        throw new ApiError(400, "something went whiled deleting video")
}

    return res
    .status(200)
    .json(
        new apiResponse(
            200, 
            deleteVideo,
            "Video deleted succesfully"
        )
    )

})



export {

    getallvideo,
    publishVideo,
    getvideobyId,
    getvideobytitle,
    updateVideo,
    deletedvideo
}