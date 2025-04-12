import mongoose from 'mongoose';
import {CoursesSchema} from "./coursesModel.js";
import {FiltersSchema} from "./filtersModel.js";

const {Schema, model} = mongoose;

const UserSchema = new Schema({
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    place_of_residence: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    birth_date: {type: Date, required: true},
    sex: {type: Number, enum: [1, 2, 3]},
    courses: {
        type: CoursesSchema,
        default: () => ({ books: [], video: [], article: [] })
    },
    preferences: {
        type:FiltersSchema,
        default:()=>({
            budget: [0,100000],
            career: null,
            degree: null,
            duration: null,
            experience: null,
            format: null
        })
    },
    character_type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Characters'}]
}, {
    timestamps: true
});

export default model('User', UserSchema);
