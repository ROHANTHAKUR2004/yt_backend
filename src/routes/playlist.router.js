import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createplaylist } from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJWT)



router.route("/").post(createplaylist)



export default router;