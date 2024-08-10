import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { user } from "../models/user.model.js";
import {uploadonCLoudnary} from '../utils/cloudnary.js'
import {apiResponse} from '../utils/apiResponse.js'


const registeruser = asyncHandler( async (req, res) => {
     
    const { fullname,username,email,password} =  req.body
     if([fullname,email,username,password].some((field) =>field?.trim()== ""))
        {
           throw new ApiError(400, "All fileds are required"); 
     }

     const existeduser = user.findOne({
        $or: [{username}, {email}]
     })
     if(existeduser){
        throw new ApiError(409, "Username and email alredy exist");
     }

     const avatarLocalPath =  req.files?.avatar[0]?.path;
     const coverImageLocalPath  = req?.files?.coverImage[0]?.path


     if(!avatarLocalPath){
        throw new ApiError(400, "Avatar required");
     }
    
      const avatar =  await uploadonCLoudnary(avatarLocalPath);
      const coverimage =  await uploadonCLoudnary(coverImageLocalPath);
     

      if(!avatar){
        throw new ApiError(400, "Avatar required");
      }


       const User = await user.create({
        fullname,
        avatar : avatar.url,
        coverImage : coverimage?.url || "",
        email,
        password,
        username : username.toLowerCase()
      })


        const usercreated =  await user.findById(User._id).select(
            "-password -refershToken"
        )

        if(!usercreated){
            throw new ApiError(500, "SOmething went wrong while creating user")
        }



        return res.status(201).json(
             new apiResponse(200, usercreated , "USer register successfully")
        )






})

export {registeruser}


// get user details from frontend or postman
// validation - not empty
// check if user already exist: by username or email
// check for images , check for avatar
// upload them on cloudnary, avatar
// create user object - create entry in db
// remove pasword and tokens from response
// check for user creation 
// retuern response
