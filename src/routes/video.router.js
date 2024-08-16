import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getallvideo, publishVideo } from "../controllers/video.controller.js";
import {upload} from "../middlewares/multer.js"
const router = Router();
router.use(verifyJWT)



router.route("/")
.get(getallvideo)
.post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
        
    ]),
    publishVideo
)

export default router