import { Router } from "express";
import { addcomment, 
    deletecomment, 
    getvideoComments, 
    updatecomment} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router  = Router();
router.use(verifyJWT);

router.route("/:videoId").get(getvideoComments).post(addcomment);
router.route("/c/:commentId").delete(deletecomment).patch(updatecomment)


export default router;
