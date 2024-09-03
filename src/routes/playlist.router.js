import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideotoplaylist, 
    createplaylist, 
    deleteplaylist, 
    getplaylistbyId,
    getuserplaylist,
    removevideoFromplaylist,
    updateplaylist} from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJWT)



router.route("/").post(createplaylist)
router.route("/add/:videoId/:playlistId").patch(addVideotoplaylist)
router.route("/:playlistId")
.get(getplaylistbyId)
.delete(deleteplaylist)
.patch(updateplaylist)
router.route("/user/:userId").get(getuserplaylist)
router.route("/remove/:videoId/:playlistId").patch(removevideoFromplaylist)

export default router;