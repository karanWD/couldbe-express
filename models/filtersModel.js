import {Mongoose, Schema} from "mongoose";

export const FiltersSchema = new Schema({
    budget: [Number],
    career: [{type: Mongoose.Schema.Types.ObjectId, ref: "Careers"}],
    degree: {type: Number},
    duration: {type: Number},
    experience: {type: Number},
    format: {type: Number}
}, {_id: false});