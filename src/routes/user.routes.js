import { registeruser } from "../controllers/user.controller.js";

import  {Router} from "express";

const router = Router();


router.route("/register").post(registeruser)

export default router