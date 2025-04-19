export const getWeakSkills = (character) => {
  const weakSkills = [];
  const levels = ["Low", "Medium"];
  const skillKeys = ["problemSolving", "technology", "leadership", "selfManagement"];

  for (const key of skillKeys) {
    if (levels.includes(character[key])) {
      weakSkills.push(key);
    }
  }

  return weakSkills;
}