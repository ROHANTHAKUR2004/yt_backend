import { asyncHandler } from "../utils/asyncHandler";

const getchannelstats = asyncHandler(async (req,res) => {
     // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
})



const getchannelVideos = asyncHandler(async (req,res) => {
     // TODO: Get all the videos uploaded by the channel
})


export {
    getchannelVideos,
    getchannelstats
}