import mongoose from "mongoose";

const {Schema,model} = mongoose

const BooksSchema = new Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    competencies: { type: [String] },
    bonus_competency: { type: String },
    level: { type: String, enum: ['Primary', 'Medium', 'Advanced'] },
    level_up_option: { type: String, enum: ['Low to Medium', 'Medium to High'] },
    language: { type: String },
    publisher: { type: String },
    number_of_pages: { type: Number },
    description: { type: String },
    skill: { type: String },
    price: { type: String },
    rating: { type: Number },
    user_reviews: { type: String },
    url: { type: String, required: true }
}, {
    timestamps: true
});

export default model("Books",BooksSchema)