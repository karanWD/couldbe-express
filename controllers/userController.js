import userModel from "../models/userModel.js";
import {requiredValidator} from "../utils/validators.js";

export const submitPreferences = async (req, res) => {
  try {
    const missedField = requiredValidator(req.body, ['budget_amount', 'course_format', 'duration', 'interested_career', 'need_degree', 'study_abroad', 'work_experience'])
    if (missedField) {
      return res.status(400).json({message: missedField + " is required. "});
    }
    const {
      budget_amount,
      course_format,
      duration,
      interested_career,
      need_degree,
      study_abroad,
      work_experience
    } = req.body;

    const userId = req.userData.id;
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        preferences: {
          budget_amount,
          course_format,
          duration,
          interested_career,
          need_degree,
          study_abroad,
          work_experience
        }
      },
      {new: true}
    );

    if (!updatedUser) {
      return res.status(404).json({message: 'user not found'});
    }

    return res.status(200).json({
      message: 'preferences updated successfully',
    });
  } catch (err) {
    return res.status(500).json({message: `server error:${err.message}`});
  }
}