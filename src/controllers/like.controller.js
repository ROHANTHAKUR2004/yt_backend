
import mongoose, { isValidObjectId } from "mongoose";
import { like } from "../models/like.model.js";
import { comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { video } from "../models/video.model.js";
import { tweet } from "../models/tweets.model.js";

// Toggle like functionality
const toggleLike = async (Model, resourceId, userId) => {
    if (!isValidObjectId(resourceId) || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user or resource ID");
    }

    const modelName = Model.modelName.toLowerCase();
    const isLiked = await like.findOne({
        [modelName]: resourceId,
        likedby: userId,  // Ensure proper casing
    });

    let response;
    try {
        if (!isLiked) {
            response = await like.create({
                [modelName]: resourceId,
                likedby: userId,
            });
        } else {
            response = await like.deleteOne({
                [modelName]: resourceId,
                likedby: userId,
            });
        }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while toggling like");
    }

    const totalLikes = await like.countDocuments({
        [modelName]: resourceId,
    });

    return { response, isLiked, totalLikes };
};

// Toggle video like
const togglevideolike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid video ID");
    }

    const { isLiked, totalLikes } = await toggleLike(video, videoId, req.User?._id);

    return res.status(200).json(new apiResponse(
        200,
        { totalLikes },
        isLiked ? "Like removed successfully" : "Liked successfully"
    ));
});

// Toggle comment like
const togglecommentlike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!isValidObjectId(commentId)) {
        throw new ApiError(401, "Invalid comment ID");
    }

    const { isLiked, totalLikes } = await toggleLike(comment, commentId, req.User?._id);

    return res.status(200).json(new apiResponse(
        200,
        { totalLikes },
        isLiked ? "Like removed successfully" : "Liked successfully"
    ));
});

// Toggle tweet like
const toggletweetlike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(401, "Invalid tweet ID");
    }

    const { isLiked, totalLikes } = await toggleLike(tweet, tweetId, req.User?._id);

    return res.status(200).json(new apiResponse(
        200,
        { totalLikes },
        isLiked ? "Like removed successfully" : "Liked successfully"
    ));
});

// Get liked videos
const getvideoLikes = asyncHandler(async (req, res) => {
    const userId = req.User?._id;

    if (!isValidObjectId(userId)) {
        throw new ApiError(401, "Invalid user ID");
    }

    const userLikes = await like.find({ likedby: userId });
    if (!userLikes.length) {
        return res.status(404).json(new apiResponse(404, [], "No liked videos found"));
    }

    const likedVideos = await like.aggregate([
        {
            $match: {
                likedby: new mongoose.Types.ObjectId(userId),
                video: { $exists: true },  // Ensure it’s matching videos
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",  // Correct localField
                foreignField: "_id",
                as: "details",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "userinfo",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $first: "$userinfo" }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                details: { $first: "$details" }
            }
        }
    ]);

    if (!likedVideos.length) {
        return res.status(404).json(new apiResponse(404, [], "No liked videos found"));
    }

    return res.status(200).json(new apiResponse(200, likedVideos, "Successfully fetched liked videos"));
});

export {
    togglecommentlike,
    toggletweetlike,
    togglevideolike,
    getvideoLikes,
};

