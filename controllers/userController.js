import userModel from "../models/userModel.js";
import {requiredValidator} from "../utils/validators.js";
import CharactersModel from "../models/charactersModel.js";
import UserModel from "../models/userModel.js";
import BooksModel from "../models/booksModel.js";
import VideosModel from "../models/videosModel.js";
import ArticlesModel from "../models/articlesModel.js";

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

const levelHandler = (score) => {
  if (score < 9) {
    return "Low"
  }
  if (score < 13) {
    return "Medium"
  }
  return "High"
}

export const submitExam = async (req, res) => {
  try {
    for (const item of req.body) {
      if (item === null) {
        return res.status(400).json({message: `all question must have answers.`});
      }
    }
    const answers = req.body
    const {id} = req.userData
    const keysMap = {
      0: "problemSolving",
      1: "leadership",
      2: "selfManagement",
      3: "technology",
    }
    const score = {
      problemSolving: null,
      leadership: null,
      selfManagement: null,
      technology: null,
    }
    const scoresMaptoValue = {
      "High": 3,
      "Medium": 2,
      "Low": 1,
    }
    for (const index in answers) {
      const target = Math.floor(index / 5)
      score[keysMap[target]] = score[keysMap[target]] + answers[index].answer_id
      if (+index === answers.length - 1) {
        for (const item of Object.keys(score)) {
          score[item] = levelHandler(score[item])
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
      return res.status(404).json({message: 'No matching character found'});
    }
    const user = await UserModel.findByIdAndUpdate(
      id,
      {character_type: bestMatch._id},
      {new: true}
    );

    res.status(200).json({
      message: 'Character type assigned successfully',
    });

  } catch (err) {
    return res.status(500).json({message: `server error:${err.message}`});
  }
}

export const getCharacterInfo = async (req, res) => {
  try {
    const {id} = req.userData
    const user = await UserModel.findById(id).populate('character_type');
    if (!user) {
      return res.status(404).json({message: "User not found"});
    }
    if (!user.character_type) {
      return res.status(404).json({message: "Character type not set for this user"});
    }
    res.status(200).json({
      character_type: user.character_type[user.character_type.length - 1],
    });
  } catch (e) {
    return res.status(500).json({message: `server error: ${e.message}`});
  }
}

export const getCoursesSuggestions = async (req, res) => {
  try {
    const {id} = req.userData;

    const user = await UserModel.findById(id).populate("character_type");
    if (!user || !user.character_type) {
      return res.status(404).json({message: "User or character type not found"});
    }

    const character = user.character_type[user.character_type.length - 1];
    const weakSkills = [];
    const skillMap = {
      problemSolving: character.problemSolving,
      technology: character.technology,
      leadership: character.leadership,
      selfManagement: character.selfManagement,
    };

    for (const [key, value] of Object.entries(skillMap)) {
      if (value === "Low") weakSkills.push(key);
    }
    for (const [key, value] of Object.entries(skillMap)) {
      if (value === "Medium" && !weakSkills.includes(key)) weakSkills.push(key);
    }

    const [books, videos, articles] = await Promise.all([
      BooksModel.find({skills: {$in: weakSkills}}),
      VideosModel.find({skills: {$in: weakSkills}}),
      ArticlesModel.find({skills: {$in: weakSkills}}),
    ]);

    res.status(200).json({
      suggestions: {
        books,
        videos,
        articles,
      },
    });
  } catch (e) {
    return res.status(500).json({message: `server error: ${e.message}`});
  }
}


export const handleUserCourses = async (req, res) => {
  try {
    const {type} = req.params;
    const {courseId} = req.body
    const {id} = req.userData

    if (!id || !courseId || !type) {
      return res.status(400).json({message: "something wrong! try again please"});
    }

    const validTypes = ["books", "videos", "articles"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({message: "Invalid course type"});
    }

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({message: "User not found"});
    if (!user.courses) {
      user.courses = { books: [], videos: [], articles: [] };
    }
    const list = user.courses[type];
    const index = list.indexOf(courseId);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(courseId);
    }

    await user.save();
    res.status(200).json({
      message: index > -1 ? "Course removed from your profile" : "Course added to your profile",
      courses: user.courses,
    });

  } catch (err) {
    res.status(500).json({message: `Server error: ${err}`});
  }
};
