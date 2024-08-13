import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { user } from "../models/user.model.js";
import {uploadonCLoudnary} from '../utils/cloudnary.js'
import {apiResponse} from '../utils/apiResponse.js'
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessTokenAndrefereshtoken = async (UserId) => {
  try {
    const User = await user.findById(UserId);
    const accesstoken = User.generateAccessToken();
    const refreshtoken = await User.generateRefershToken(); // Use 'await' here

    User.refreshtoken = refreshtoken;
    await User.save({ validateBeforeSave: false });

    return { accesstoken, refreshtoken };
} catch (error) {
    console.error("Error generating tokens:", error);
    throw error;
}
}

const registeruser = asyncHandler( async (req, res) => {
     
    const { fullname,username,email,password} =  req.body
     if([fullname,email,username,password].some((field) =>field?.trim()== ""))
        {
           throw new ApiError(400, "All fileds are required"); 
     }

     const existeduser =  await user.findOne({
        $or: [{username}, {email}]
     })
     if(existeduser){
        throw new ApiError(409, "Username and email alredy exist");
     }

      const avatarLocalPath =  req.files?.avatar[0]?.path;
    
     let coverImageLocalPath;
     if(req.files && Array.isArray(req.files.coverimage) 
        && req.files.coverimage.length > 0 ){
            coverImageLocalPath = req.files.coverimage[0].path
        }

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

const loginUser = asyncHandler(async (req,res) =>{
  const { username,email,password} =  req.body

  if(!(username || email)){
    throw new ApiError(400, "Username or email is required")
  }

   const User = await user.findOne({
    $or : [{username}, {email}]
  })

  if(!User){
    throw new ApiError(404, " user not found , please register user")
  }

  const ispasswordvalid = await User.isPasswordCorrect(password)
  if(!ispasswordvalid){
    throw new ApiError(401, "password incorrect , please fill correct password")
  }

   const {accestoken, refreshtoken} = await generateAccessTokenAndrefereshtoken(User._id)

  
  const loggiedinuser =  await user.findById(User._id).select(
       "-password -refreshtoken"
  )

  const options = {
      httpOnly : true,
      secure : true
  }

  return res
  .status(200)
  .cookie("accesstoken", accestoken, options)
  .cookie("refreshtoken", refreshtoken, options)
  .json(
    new apiResponse(
      200,
      {
        user : loggiedinuser , accestoken, refreshtoken
      },
      "USer Logged in successfully "
    )
  )
})

const logoutuser =  asyncHandler(async (req,res) => {
   user.findByIdAndUpdate(
    req.User._id,{
      $unset : {
        refreshtoken : 1
      }
    },{
      new : true
    }
   )
   const options = {
    httpOnly : true,
    secure : true
}

    return res.status(200)
    .clearCookie("accesstoken", options)
    .clearCookie("refreshtoken", options)
    .json(
      new apiResponse(
        200, {}, "user loged out"
      )
    )



})

const refreshaccesstoken = asyncHandler( async (req,res) => {
  const incomingrefreshtoken = req.cookies.refreshtoken  || req.header("Authorization")?.replace("Bearer ", "");
 
     if(!incomingrefreshtoken){
      throw new ApiError(401, "unauthorized request")
     }

     try {
       const decodedtoken =  jwt.verify(
       incomingrefreshtoken,
       process.env.REFERESH_TOKEN_SECRET
      )
 
      const User =  await user.findById(decodedtoken?._id)
      if(!User){
        throw new ApiError(401, "invalid refresh token")
      }
 
      if(incomingrefreshtoken !== User?.refreshtoken){
          throw new ApiError(401, "Refresh token is expired or used")
      }
 
      const options = {
       httpOnly : true,
       secure : true
      }
 
       const {accesstoken , newrefreshtoken} = await generateAccessTokenAndrefereshtoken(User._id)
         
       return res
       .status(200)
       .cookie("accesstoken", accesstoken, options)
       .cookie("refreshtoken", newrefreshtoken, options)
       .json(
         new apiResponse(
           200,
           {accesstoken, refereshtoken : newrefreshtoken},
           "access token refresh successfully"
         )
       )
 
     } catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh token")
     }
    })


const changeCurrentPassword = asyncHandler(async (req,res) => {
   const {oldpassword , newpassword} = req.body

    const User = await user.findById(req.User?._id)
    const ispasswordvalid = await User.isPasswordCorrect(oldpassword)
    if(!ispasswordvalid){
      throw new ApiError(400, "invalid old password")
    }

    User.password = newpassword
    await User.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(new apiResponse (
       200, {}, "password change successfully"
    ))
    })

const getcurrentuser = asyncHandler(async (req,res) => {
       return res
       .status(200)
       .json( new apiResponse(
        200,
        req.User,
        "USer fetched Successfully"
       )) 
      })

const updateaccountdetails = asyncHandler(async (req,res) => {
      
    const {username ,email} = req.body
    
    if(!username || !email){
      throw new ApiError(400, "all fileds required")
    }

    const User  = await user.findByIdAndUpdate(
      req.User?._id,
       {
          $set : {
            fullname : fullname,
            email : email
          }
       },{
        new : true
       }
    ).select("-password")

   
    return res
    .status(200)
    .json(new apiResponse (
       200, 
       User,
       "account details updated succesfully"
    ))
     


  })

const updateavatar = asyncHandler(async (req,res) => {
       const avatarLocalPath = req.file?.path
       if(!avatarLocalPath){
        throw new ApiError(400, "avatar file required")
       }

      const avatar =  await uploadonCLoudnary(avatarLocalPath)
 
      if(!avatar.url){
        throw new ApiError(400, "error while uploading avatar")
      }

      const User = await user.findByIdAndUpdate(
        req.User?._id,
        {
          $set : {
            avatar:  avatar.url
          }
        },{
          new : true
        }
      ).select("-password")

      return res
      .status(200)
      .json(new apiResponse (
        200, User , "avatar image upadted succesfully"
      ))
 
    })

const updatecover = asyncHandler(async (req,res) => {
      const coverLocalPath = req.file?.path
      if(!coverLocalPath){
       throw new ApiError(400, "cover file required")
      }

     const coverimage =  await uploadonCLoudnary(coverLocalPath)

     if(!avatar.url){
       throw new ApiError(400, "error while uploading cover")
     }

     const User =  await user.findByIdAndUpdate(
       req.User?._id,
       {
         $set : {
           coverimage:  coverimage.url
         }
       },{
         new : true
       }
     ).select("-password")


     return res
      .status(200)
      .json(new apiResponse (
        200, User , "cover image upadted succesfully"
      ))

   })


const getUserChannelProfile =  asyncHandler(async (req,res) => {
    
       const {username} = req.params

       if(!username?.trim()){
        throw new ApiError(400, "username is missing")
       }

        const channel = await user.aggregate([ 
          {
            $match : {
              username : username?.toLowerCase()
            }
          }, {
            $lookup : {
              from : "subscriptions",
              localField : "_id",
              foreignField : "channel",
              as : "subscribers"

            }
          }, {
            $lookup : {
              from : "subscriptions",
              localField : "_id",
              foreignField : "subscriber",
              as : "subscribedto"
            }
          }, {
            $addFields: {
                  subscribersCount : {
                     $size : "$subscribers"
                  },
                  channelsubscribedtoCount : {
                    $size : "$subscribedto"
                  },
                  issubscribed : {
                    $cond: {
                      if : {$in: [req.user?._id, "$subscribers.subscriber"]},
                      then : true,
                      else : false
                    }
                  }
            }
          }, {
            $project : {
                fullname : 1,
                username : 1,
                subscribersCount : 1,
                channelsubscribedtoCount : 1,
                issubscribed : 1,
                avatar : 1,
                coverimage : 1,
                email : 1
            }
          }
        ])

        if(!channel?.length){
            throw new ApiError(400, "channel doesnt not exist")
        }

        return res
        .status(200)
        .json(new apiResponse(
          200,
          channel[0],
          "user channel fethed successfully"
        ))

   })

const GetWatchhistory = asyncHandler(async (req,res) => {
      const User =  await user.aggregate([
        {
          $match : {
             _id : new mongoose.Types.ObjectId(req.User._id)
          }
        },
        {
          $lookup :{
            from : "videos",
            localField : "watchHistory",
            foreignField : "_id",
            as : "watchHistory",
            pipeline : [
              {
                $lookup :{
                  from : "users",
                  localField: "owner",
                  foreignField: "_id",
                  as : "owner",
                  pipeline :[
                    {
                     $project :{
                         fullname : 1,
                         username : 1,
                         avatar : 1
                     }
                  }
                ]
                }
              },
              {
                $addFields :{
                  owner : {
                      $first : "$owner"
                  }
                }
              }
            ]
          }
        }
      ])

      return res
      .status(200)
      .json(
        new apiResponse (
          200,
          User[0].watchHistory,
          "watch history succesfully"
        )
      )


})  


export {
  registeruser,
  loginUser,
  logoutuser, 
  refreshaccesstoken,
  changeCurrentPassword,
  getcurrentuser,
  updateaccountdetails,
  updateavatar,
  updatecover,
  getUserChannelProfile,
  GetWatchhistory

  }

//USER REGISTER STEPS
// get user details from frontend or postman
// validation - not empty
// check if user already exist: by username or email
// check for images , check for avatar
// upload them on cloudnary, avatar
// create user object - create entry in db
// remove pasword and tokens from response
// check for user creation 
// retuern response



//Login user steps

// req body -> data
// username or email
// find the user or email n databse
// check  passowrd
// acces and referesh token 
//  send cookies 
// return response

