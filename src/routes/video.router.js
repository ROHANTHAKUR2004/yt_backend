import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deletedvideo, getallvideo, getvideobyId,  getvideobytitle,  publishVideo } from "../controllers/video.controller.js";
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


router.route("/:videoId").get(getvideobyId)
router.route("/:title").post(getvideobytitle)

router.route("/:videoId").delete(deletedvideo)

export default router