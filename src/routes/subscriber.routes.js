import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscriptionChannels, getUserChannelSubscription, 
    toggleSubscription } from "../controllers/subscription.controler.js";

const router = Router();
router.use(verifyJWT);


router.route("/c/:channelId")
.get(getSubscriptionChannels)
.post(toggleSubscription)



router.route("/u/:channelId").get(getUserChannelSubscription);

export default router;