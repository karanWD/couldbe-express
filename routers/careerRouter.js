import {Router} from "express";
import {getCareers} from "../controllers/careerController.js";

const router = Router()

router.post("/",getCareers)

export default router