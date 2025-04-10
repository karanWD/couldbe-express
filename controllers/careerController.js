import CareersModel from "../models/careersModel.js";

export const getCareers = async (req,res) => {
  try{
      const res = await CareersModel.find({})
  }catch (e) {

  }
}