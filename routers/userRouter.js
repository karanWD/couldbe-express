import {Router} from "express";
import {
  getCharacterInfo,
  getCoursesSuggestions,
  handleUserCourses,
  submitExam,
  submitPreferences
} from "../controllers/userController.js";

const router = Router()

router.post("/preferences",submitPreferences)
router.post("/exam",submitExam)
router.get("/character",getCharacterInfo)
router.get("/suggestions",getCoursesSuggestions)
router.post("/courses/:type",handleUserCourses)

export default router