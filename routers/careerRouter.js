import {Router} from "express";
import {getCareers} from "../controllers/careerController.js";

const router = Router()

router.get("/",getCareers)

export default router