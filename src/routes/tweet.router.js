import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createtweet, getusertweet } from "../controllers/tweet.controller.js";


const router = Router();
router.use(verifyJWT)


router.route("/").post(createtweet)
router.route("/user/:userId").get(getusertweet)

export default router;