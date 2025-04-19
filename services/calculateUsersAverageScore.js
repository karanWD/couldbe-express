import UserModel from "../models/userModel.js";

export const calculateUsersAverageScore = async () => {
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