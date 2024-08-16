import { asyncHandler } from "../utils/asyncHandler.js";
import { video }from "../models/video.model.js"
import { ApiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { uploadonCLoudnary } from "../utils/cloudnary.js";


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

      console.log("videofile is " ,videoFile )
      console.log("thumbfile is " ,thumbnail)

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
      //TODO: get video by id
})

const updateVideo = asyncHandler(async (req,res) => {
     const {videoId} = req.params
     //TODO: update video details like title, description, thumbnail
})

const deletedvideo = asyncHandler(async (req,res) => {
    const {videoId} = req.params
})



export {

    getallvideo,
    publishVideo,
    getvideobyId,
    updateVideo,
    deletedvideo
}