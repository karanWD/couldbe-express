import userModel from "../models/userModel.js";
import {requiredValidator} from "../utils/validators.js";
import CharactersModel from "../models/charactersModel.js";
import UserModel from "../models/userModel.js";

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

const levelHandler = (score)=>{
  if (score<9){
    return "Low"
  }
  if (score<13){
    return "Medium"
  }
  return "High"
}

export const submitExam = async (req,res)=>{
  try{
    for (const item of req.body){
      if (item===null){
        return res.status(400).json({message: `all question must have answers.`});
      }
    }
    const answers = req.body
    const {id} = req.userData
    const keysMap = {
      0:"problemSolving",
      1:"leadership",
      2:"selfManagement",
      3:"technology",
    }
    const score = {
      problemSolving:null,
      leadership:null,
      selfManagement:null,
      technology:null,
    }
    const scoresMaptoValue = {
      "High":3,
      "Medium":2,
      "Low":1,
    }
    for (const index in answers){
      const target = Math.floor(index / 5)
      score[keysMap[target]] = score[keysMap[target]] + answers[index].answer_id
      if(+index===answers.length-1){
        for (const item of Object.keys(score)){
          score[item]=levelHandler(score[item])
        }
      }
    }

    const characters = await CharactersModel.find()
    let bestMatch = null;
    let smallestDiff = Infinity;

    for (const char of characters) {
      const diff =
        Math.abs(scoresMaptoValue[char.problemSolving] - scoresMaptoValue[score.problemSolving]) +
        Math.abs(scoresMaptoValue[char.leadership] - scoresMaptoValue[score.leadership]) +
        Math.abs(scoresMaptoValue[char.technology] - scoresMaptoValue[score.technology]) +
        Math.abs(scoresMaptoValue[char.selfManagement] - scoresMaptoValue[score.selfManagement]);


      if (diff < smallestDiff) {
        smallestDiff = diff;
        bestMatch = char;
      }

    }
    if (!bestMatch) {
      return res.status(404).json({ message: 'No matching character found' });
    }
    const user = await UserModel.findByIdAndUpdate(
      id,
      { character_type: bestMatch._id },
      { new: true }
    );

    res.status(200).json({
      message: 'Character type assigned successfully',
    });

  }catch (err) {
    return res.status(500).json({message: `server error:${err.message}`});
  }
}