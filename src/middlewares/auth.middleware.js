import { user } from "../models/user.model";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
export const verifyJWT = asyncHandler( async (req,_,next) => {
    try {
        const token =  req.cookies?.accesstoken  || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError(401, "unauthorized request")
        }
        
         const decodedtoken =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        
         const User = await user.findById(decodedtoken?._id).select(
             "-password -refershToken"
         )
    
         if(!User){
            throw new ApiError(401, "invalid acess token")
         }
    
         req.User = User;
         next()
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid access token ")
    }
})

