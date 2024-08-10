import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { user } from "../models/user.model.js";
import {uploadonCLoudnary} from '../utils/cloudnary.js'
import {apiResponse} from '../utils/apiResponse.js'


const generateAccessTokenAndrefereshtoken = async (UserId) => {
  try {
      const User  = await user.findById(UserId)
      const accestoken =  User.generateAccessToken()
      const refereshtoken =  User.generateRefershToken()

      User.refereshtoken = refereshtoken
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

  if(!username || !email){
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
       "-password -refershToken"
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
        refershToken : undefined
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



export {registeruser, loginUser, logoutuser}

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

