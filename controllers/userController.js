import userModel from "../models/userModel.js";
import {requiredValidator} from "../utils/validators.js";
import CharactersModel from "../models/charactersModel.js";
import UserModel from "../models/userModel.js";
import BooksModel from "../models/booksModel.js";
import VideosModel from "../models/videosModel.js";
import ArticlesModel from "../models/articlesModel.js";
import videosModel from "../models/videosModel.js";
import articlesModel from "../models/articlesModel.js";

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

const usersScoreAverage = async () => {
  const users = await UserModel.find({}, "scores");

  const totals = {
    problemSolving: 0,
    leadership: 0,
    selfManagement: 0,
    technology: 0,
  };

  let count = 0;
  users.forEach(user => {
    const score = user.scores;
    if (!score) return;

    totals.problemSolving += score.problemSolving || 0;
    totals.leadership += score.leadership || 0;
    totals.selfManagement += score.selfManagement || 0;
    totals.technology += score.technology || 0;

    count++;
  });

  return ({
    problemSolving: +(totals.problemSolving / count).toFixed(2),
    leadership: +(totals.leadership / count).toFixed(2),
    selfManagement: +(totals.selfManagement / count).toFixed(2),
    technology: +(totals.technology / count).toFixed(2),
  });

}

const coursesEffectScore = async (courses) => {
  let skillScore = {
    problemSolving: 0,
    selfManagement: 0,
    technology: 0,
    leadership: 0
  }

  const mapLevelupToScore = {
    "Low to Medium": 2.5,
    "Medium to High": 3.5,
    "Low to High": 6,
  }

  courses.forEach(course => {
    skillScore[course.skill] += mapLevelupToScore[course.level_up_option];
  });
  return skillScore;
}

export const getCoursesSuggestions = async (req, res) => {
  try {
    const {id} = req.userData;

    const user = await UserModel.findById(id).populate("character_type")
      .populate([
        {path: "courses.books", model: "Books"},
        {path: "courses.videos", model: "Videos"},
        {path: "courses.articles", model: "Articles"},
      ])

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

    const suggestions = await Promise.all([
      BooksModel.find({skill: {$in: weakSkills}}),
      VideosModel.find({skills: {$in: weakSkills}}),
      ArticlesModel.find({skills: {$in: weakSkills}}),
    ]);

    console.log(weakSkills)

    const models = [
      BooksModel,
      videosModel,
      articlesModel,
    ]

    for (const index in suggestions) {
      if (suggestions[index].length === 0) {
        suggestions[index] = await models[index].find({level: "Advanced"})
      }
    }
    const allCourses = Object.values(JSON.parse(JSON.stringify(user.courses))).flat()
    const average = await usersScoreAverage()
    const couldbe = await coursesEffectScore(allCourses)
    for (const item in {...user.scores}) {
      couldbe[item] += user.scores[item]
    }
    const scores = {
      current: user.scores,
      average,
      couldbe
    }

    const [books, videos, articles] = suggestions
    res.status(200).json({
      scores,
      suggestions: {
        books,
        videos,
        articles,
      },
      courses: user.courses,
    });
  } catch (e) {
    return res.status(500).json({message: `server error: ${e.message}`});
  }
}


export const handleUserCourses = async (req, res) => {
  try {
    const {type} = req.params;
    const {courseId} = req.body;
    const {id} = req.userData;

    if (!id || !courseId || !type) {
      return res.status(400).json({message: "something wrong! try again please"});
    }

    const validTypes = ["books", "videos", "articles"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({message: "Invalid course type"});
    }

    const user = await UserModel.findById(id).populate([
      {path: "courses.books", model: "Books",},
      {path: "courses.videos", model: "Videos",},
      {path: "courses.articles", model: "Articles",},
    ]);
    if (!user) return res.status(404).json({message: "User not found"});

    if (!user.courses) {
      user.courses = {books: [], videos: [], articles: []};
    }

    const list = user.courses[type];
    const index = list.findIndex(item => item._id.toString() === courseId);

    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(courseId);
    }

    await user.save();

    // Re-populate after save to get updated full course data
    await user.populate([
      {path: "courses.books", model: "Books",},
      {path: "courses.videos", model: "Videos",},
      {path: "courses.articles", model: "Articles",},
    ]);

    const allCourses = [
      ...user.courses.books,
      ...user.courses.videos,
      ...user.courses.articles,
    ];

    const couldbe = await coursesEffectScore(allCourses);

    // Sum current user scores with future improvements
    for (const item in {...user.scores}) {
      couldbe[item] += user.scores[item];
    }

    res.status(200).json({
      message: index > -1 ? "Course removed from your profile" : "Course added to your profile",
      courses: user.courses,
      couldbe,
    });

  } catch (e) {
    res.status(500).json({message: `Server error: ${e}`});
  }
};


export const getUserRoadmap = async (req, res) => {
  try {
    const {id} = req.userData
    const user = await UserModel.findById(id)
      .populate("character_type")
      .populate([
        {path: "courses.books", model: "Books"},
        {path: "courses.videos", model: "Videos"},
        {path: "courses.articles", model: "Articles"},
      ]).select("character_type courses scores")

    const allCourses = Object.values(JSON.parse(JSON.stringify(user.courses))).flat()
    const average = await usersScoreAverage()
    const couldbe = await coursesEffectScore(allCourses)
    for (const item in {...user.scores}) {
      couldbe[item] += user.scores[item]
    }
    const scores = {
      current: user.scores,
      average,
      couldbe
    }

    res.status(200).json({
        character_type: user.character_type[user.character_type.length - 1],
        courses: user.courses,
        scores
      }
    )
  } catch (e) {
    res.status(500).json({message: `Server error: ${e}`})
  }
}
