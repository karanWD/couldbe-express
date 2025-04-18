import userModel from "../models/userModel.js";
import {requiredValidator} from "../utils/validators.js";
import CharactersModel from "../models/charactersModel.js";
import UserModel from "../models/userModel.js";
import BooksModel from "../models/booksModel.js";
import VideosModel from "../models/videosModel.js";
import ArticlesModel from "../models/articlesModel.js";
import {calculateCoursesScore} from "../services/calculateCoursesScore.js";
import {getWeakSkills} from "../services/findWeakSkills.js";
import {calculateUsersAverageScore} from "../services/calculateUsersAverageScore.js";

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
    let scores = {}
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
          scores[item] = score[item]
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
      {character_type: bestMatch._id, scores},
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
    const { id } = req.userData;

    const user = await UserModel.findById(id)
      .populate("character_type")
      .populate([
        { path: "courses.books", model: "Books" },
        { path: "courses.videos", model: "Videos" },
        { path: "courses.articles", model: "Articles" },
      ]);

    if (!user || !user.character_type?.length) {
      return res.status(404).json({ message: "User or character type not found" });
    }

    const character = user.character_type.at(-1);
    const weakSkills = getWeakSkills(character);

    async function findSuggestions(model, skills, field = "skill") {
      let result = await model.find({ [field]: { $in: skills } });
      if (result.length === 0) {
        result = await model.find({ level: "Advanced" }).limit(5);
      }
      return result;
    }

    const [books, videos, articles] = await Promise.all([
      findSuggestions(BooksModel, weakSkills),
      findSuggestions(VideosModel, weakSkills),
      findSuggestions(ArticlesModel, weakSkills),
    ]);

    const allCourses = Object.values(user.courses).flat();
    const [average, couldbe] = await Promise.all([
      calculateUsersAverageScore(),
      calculateCoursesScore(allCourses)
    ]);

    // const couldbe = { ...couldBeEffect };
    for (const key in {...user.scores}) {
      couldbe[key] += user.scores[key] || 0;
    }

    return res.status(200).json({
      scores: {
        current: user.scores,
        average,
        couldbe
      },
      suggestions: { books, videos, articles },
      courses: user.courses,
    });

  } catch (e) {
    return res.status(500).json({ message: `Server error: ${e.message}` });
  }}


export const handleUserCourses = async (req, res) => {
  try {
    const {type} = req.params;
    const {courseId} = req.body;
    const {id} = req.userData;

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({message: "User not found"});

    if (!user.courses) {
      user.courses = {books: [], videos: [], articles: []};
    }

    const list = user.courses[type];
    const index = list.findIndex(item => item.toString() === courseId);

    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(courseId);
    }

    await user.save();

    const bookIds = user.courses.books;
    const videoIds = user.courses.videos;
    const articleIds = user.courses.articles;

    const [books, videos, articles] = await Promise.all([
      BooksModel.find({ _id: { $in: bookIds } }).select("_id skill level_up_option"),
      VideosModel.find({ _id: { $in: videoIds } }).select("_id skill level_up_option"),
      ArticlesModel.find({ _id: { $in: articleIds } }).select("_id skill level_up_option")
    ]);

    const allCourses = [...books, ...videos, ...articles];

    const couldbe = await calculateCoursesScore(allCourses);

    for (const item in {...user.scores}) {
      couldbe[item] += user.scores[item];
    }

    res.status(200).json({
      message: index > -1 ? "Course removed from your profile" : "Course added to your profile",
      courses: {books, videos, articles},
      couldbe,
    });

  } catch (e) {
    res.status(500).json({message: `Server error: ${e}`});
  }
};


export const getUserRoadmap = async (req, res) => {
  try {
    const { id } = req.userData;

    const user = await UserModel.findById(id)
      .select("character_type courses scores")
      .populate("character_type")
      .populate([
        { path: "courses.books", model: "Books" },
        { path: "courses.videos", model: "Videos" },
        { path: "courses.articles", model: "Articles" },
      ])
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const latestCharacter = user.character_type?.at(-1);
    const allCourses = Object.values(user.courses ?? {}).flat();

    const [average, couldbeBase] = await Promise.all([
      calculateUsersAverageScore(),
      calculateCoursesScore(allCourses),
    ]);

    const couldbe = { ...couldbeBase };
    for (const skill in {...user.scores}) {
      couldbe[skill] += user.scores[skill];
    }

    const scores = {
      current: user.scores,
      average,
      couldbe,
    };

    res.status(200).json({
      character_type: latestCharacter,
      courses: user.courses,
      scores,
    });

  } catch (e) {
    res.status(500).json({ message: `Server error: ${e.message}` });
  }
};



export const getUserStatus = async (req,res)=>{
  try {
    const { id } = req.userData;

    if (!id) {
      return res.status(400).json({ message: "User ID not provided" });
    }

    const user = await UserModel.findById(id)
      .select("character_type preferences courses")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hasCourses =
      user.courses &&
      (user.courses.books?.length > 0 ||
        user.courses.videos?.length > 0 ||
        user.courses.articles?.length > 0);

    if (hasCourses) {
      return res.status(200).json({ step: 2 }); // Step 2: Has courses
    }

    if (user.character_type && user.character_type.length > 0) {
      return res.status(200).json({ step: 1 }); // Step 1: Has character_type but no courses
    }

    if (user.preferences && Object.keys(user.preferences).length > 0) {
      return res.status(200).json({ step: 0 }); // Step 0: Has preferences only
    }

    return res.status(200).json({ step: -1 });

  }
  catch (err){
    res.status(500).json({message: `Server error: ${err}`})
  }
}

