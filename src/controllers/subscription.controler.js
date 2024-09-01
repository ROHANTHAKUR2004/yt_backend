import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { subscription } from "../models/subscription.model.js"
import { user } from "../models/user.model.js";

const toggleSubscription = asyncHandler(async (req,res) => {
    const {channelId} = req.params
    const {sub} = req.query
    if(!isValidObjectId(channelId)){
        throw new ApiError(400 ,"channel id is required")
    }

    if(sub === "true"){
        await subscription.deleteOne({
            channel : channelId,
            subscriber : req.user?.id
        })

    }
    else {
        await subscription.create({
            subscription : req.User?.id,
            channel : channelId
        })
    }
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {},
            "subscription toogeld succesfully"

        )
    )
})

const getUserChannelSubscription = asyncHandler(async (req,res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new  ApiError(400, "channel id is required")
    }

    const channel = await subscription.aggregate([
        {
            $match : {
                channel : new mongoose.Types.ObjectId(`${channelId}`)
            }
        }
    ])

    const subscribercount = channel.length;
   
    return res
    .status(200)
    .json(new apiResponse(
        200,
        subscribercount,
        "successfully fetched subscriber for the channel "
    ))


})

const getSubscriptionChannels = asyncHandler(async (req,res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(400 , "channel id missing")
    }
    const channel = await subscription.aggregate([
        {
            $match: {
                $and : [
                    {
                        channel : new mongoose.Types.ObjectId(`${channelId}`),
                        subscriber : new mongoose.Types.ObjectId(`${req.User._id}`)
                    }
                ]
            }
        }
    ])

    const issubscribed = channel.length
    
    
    return res
    .status(200)
    .json(
        new apiResponse(200 , issubscribed, "user subscribed or not ")
    )
})

export {
    toggleSubscription,
    getSubscriptionChannels,
    getUserChannelSubscription
}