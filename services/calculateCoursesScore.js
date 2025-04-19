export const calculateCoursesScore = (courses) => {
  let skillScore = {
    problemSolving: 0,
    selfManagement: 0,
    technology: 0,
    leadership: 0
  }

  const mapLevelUpToScore = {
    "Low to Medium": 2.5,
    "Medium to High": 3.5,
    "Low to High": 6,
  }

  courses.forEach(course => {
    skillScore[course.skill] += mapLevelUpToScore[course.level_up_option];
  });
  return skillScore;
}