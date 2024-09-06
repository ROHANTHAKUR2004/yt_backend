import { asyncHandler } from "../utils/asyncHandler";

const getvideoComments = asyncHandler(async (req,res) => {
     //TODO: get all comments for a video
      const {videoId} = req.params
      const {page = 1, limit = 10} = req.query
})

const addcomment = asyncHandler(async (req,res) => {
    // add comment todo
})


const updatecomment = asyncHandler(async (req,res) => {
    
})

const deletecomment = asyncHandler(async (req,res) => {
    

})

export {
    addcomment,
    getvideoComments,
    updatecomment,
    deletecomment
}