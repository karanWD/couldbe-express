import {Router} from "express";
import {submitPreferences} from "../controllers/userController.js";

const router = Router()

router.post("/preferences",submitPreferences)

export default router