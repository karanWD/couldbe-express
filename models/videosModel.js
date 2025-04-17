import mongoose from "mongoose";

const {Schema,model} = mongoose

const VideosSchema = new Schema({
    title: { type: String, required: true },
    channel: { type: String, required: true },
    competencies: { type: [String] },
    bonus_competency: { type: String },
    level: { type: String, enum: ['Primary', 'Medium', 'Advanced'] },
    level_up_option: { type: String, enum: ['Low to Medium', 'Medium to High'] },
    duration:{type:String},
    description: { type: String },
    skill: { type: String },
    url: { type: String, required: true }
}, {
    timestamps: true
})

export default model("Videos",VideosSchema)