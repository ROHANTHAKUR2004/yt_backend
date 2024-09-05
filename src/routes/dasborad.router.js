import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getchannelstats, getchannelVideos } from "../controllers/dashboard.controller.js";
const router  = Router();

router.use(verifyJWT);

router.route("/videos").get(getchannelVideos)
router.route("/stats").get(getchannelstats);

export default router;