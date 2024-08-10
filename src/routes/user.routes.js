import { loginUser,  logoutuser, registeruser } from "../controllers/user.controller.js";

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

router.route("logout").post(
  verifyJWT,
  logoutuser
)

export default router