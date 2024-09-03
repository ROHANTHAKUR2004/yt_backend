import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideotoplaylist, 
    createplaylist, 
    getplaylistbyId,
    getuserplaylist} from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJWT)



router.route("/").post(createplaylist)
router.route("/add/:videoId/:playlistId").patch(addVideotoplaylist)
router.route("/:playlistId").get(getplaylistbyId)
router.route("/user/:userId").get(getuserplaylist)

export default router;