import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createtweet, deletetweet, getusertweet, updatetweet } from "../controllers/tweet.controller.js";


const router = Router();
router.use(verifyJWT)


router.route("/").post(createtweet)
router.route("/user/:userId").get(getusertweet)
router.route("/:tweetid").patch(updatetweet).delete(deletetweet)

export default router;