import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { user } from "../models/user.model.js";
import {uploadonCLoudnary} from '../utils/cloudnary.js'
import {apiResponse} from '../utils/apiResponse.js'
import jwt from "jsonwebtoken"

const generateAccessTokenAndrefereshtoken = async (UserId) => {
  try {
      const User  = await user.findById(UserId)
      const accestoken =  User.generateAccessToken()
      const refereshtoken =  User.generateRefershToken()

      User.refershtoken = refereshtoken
      await  User.save({validateBeforeSave : false})

     return {accestoken, refereshtoken}



  } catch (error) {
     throw new ApiError(500, "something went wrong while gwnerating tokens")
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

   const {accestoken, refereshtoken} = await generateAccessTokenAndrefereshtoken(User._id)

  
  const loggiedinuser =  await user.findById(User._id).select(
       "-password -refershtoken"
  )

  const options = {
      httpOnly : true,
      secure : true
  }

  return res
  .status(200)
  .cookie("accesstoken", accestoken, options)
  .cookie("refreshtoken", refereshtoken, options)
  .json(
    new apiResponse(
      200,
      {
        user : loggiedinuser , accestoken, refereshtoken
      },
      "USer Logged in successfully "
    )
  )
})

const logoutuser =  asyncHandler(async (req,res) => {
   user.findByIdAndUpdate(
    req.User._id,{
      $set : {
        refershtoken : undefined
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
     const incomingrefreshtoken =   req.cookies.refereshtoken || req.body.refereshtoken

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
 
      if(incomingrefreshtoken !== User?.refershtoken){
          throw new ApiError(401, "Refresh token is expired or used")
      }
 
      const options = {
       httpOnly : true,
       secure : true
      }
 
       const {accesstoken , newrefereshtoken} = await generateAccessTokenAndrefereshtoken(User._id)
         
       return res
       .status(200)
       .cookie("accesstoken", accesstoken, options)
       .cookie("refreshtoken", newrefereshtoken, options)
       .json(
         new apiResponse(
           200,
           {accesstoken, refereshtoken : newrefereshtoken},
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

