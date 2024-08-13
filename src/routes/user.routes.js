import { changeCurrentPassword, getcurrentuser, getUserChannelProfile, GetWatchhistory, loginUser, logoutuser, refreshaccesstoken, registeruser, updateaccountdetails, updateavatar, updatecover } from "../controllers/user.controller.js";

import  {Router} from "express";
import {upload} from "../middlewares/multer.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();


router.route("/register").post(
    upload.fields([
        {
          name : "avatar",
          maxCount : 1  
        },{
           name : "coverimage",
           maxCount : 1
        }
    ]),
    registeruser
    )

router.route("/login").post(
  loginUser
)    

router.route("/logout").post(
  verifyJWT,
  logoutuser
)
router.route("/refreshtoken").post(
  refreshaccesstoken
)

router.route("/changepassword").post(
  verifyJWT,
   changeCurrentPassword
)

router.route("/currentuser").get(
  verifyJWT,
  getcurrentuser
)

router.route("/updateaccount/details").patch(
  verifyJWT,
  updateaccountdetails
)

router.route("/update/avatar").patch(
  verifyJWT,
  upload.single("avatar"),
  updateavatar
)

router.route("/update/cover").patch(
  verifyJWT,
  upload.single("coverimage"),
  updatecover
)

router.route("/channel/:username").get(
  verifyJWT,
  getUserChannelProfile
)

router.route("/history").get(
  verifyJWT,
  GetWatchhistory
)





export default router