import CareersModel from "../models/careersModel.js";

export const getCareers = async (req, res) => {
  try {
    const careers = await CareersModel.find();
    res.status(200).json({ data: careers });
  } catch (err) {
    res.status(500).json({ message: 'server error on careers' });
  }
};