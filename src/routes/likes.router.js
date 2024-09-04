import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getvideoLikes, togglecommentlike, toggletweetlike, togglevideolike } from "../controllers/like.controller.js";

const router = Router();
router.use(verifyJWT);


router.route("/toggle/v/:videoId").post(togglevideolike);
router.route("/toggle/c/:commentId").post(togglecommentlike);
router.route("/toggle/t/:tweetid").post(toggletweetlike);
router.route("/videos").get(getvideoLikes)

export default router;