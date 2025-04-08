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
    courses: CoursesSchema,
    filters: FiltersSchema,
    character_type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Characters'}]
}, {
    timestamps: true
});

export default model('User', UserSchema);
