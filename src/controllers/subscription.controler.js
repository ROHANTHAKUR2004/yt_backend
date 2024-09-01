import { asyncHandler } from "../utils/asyncHandler";

const toggleSubscription = asyncHandler(async (req,res) => {
    const {channelId} = req.params
    
})

const getUserChannelSubscription = asyncHandler(async (req,res) => {
    const {channelId} = req.params
})

const getSubscriptionChannels = asyncHandler(async (req,res) => {
    const {subscriberId} = req.params
})

export {
    toggleSubscription,
    getSubscriptionChannels,
    getUserChannelSubscription
}