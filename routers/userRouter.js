import {Router} from "express";
import {
  getCharacterInfo,
  getCoursesSuggestions, getUserRoadmap, getUserStatus,
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
router.get("/roadmap",getUserRoadmap)
router.get("/status",getUserStatus)

export default router