import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideotoplaylist, 
    createplaylist } from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJWT)



router.route("/").post(createplaylist)
router.route("/add/:videoId/:playlistId").patch(addVideotoplaylist)



export default router;