import mongoose, {Schema} from "mongoose";

export const FiltersSchema = new Schema({
    budget_amount: [Number],
    interested_career: [{type: mongoose.Schema.Types.ObjectId, ref: "Careers"}],
    need_degree: {type: Number},
    duration: {type: Number},
    work_experience: {type: Number},
    course_format: {type: Number},
    study_abroad:{type: Number}
}, {_id: false});