import mongoose, {Schema} from "mongoose";

export const CoursesSchema = new Schema({
    books: [{type: mongoose.Schema.Types.ObjectId, ref: 'Books'}],
    video: [{type: mongoose.Schema.Types.ObjectId, ref: 'Videos'}],
    article: [{type: mongoose.Schema.Types.ObjectId, ref: 'Articles'}]
}, {_id: false});

