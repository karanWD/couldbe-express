import {Router} from "express";
import {submitExam, submitPreferences} from "../controllers/userController.js";

const router = Router()

router.post("/preferences",submitPreferences)
router.post("/exam",submitExam)

export default router