import mongoose, {Schema} from "mongoose";

export const CoursesSchema = new Schema({
    books: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Books',
        default: []
    },
    videos: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Videos',
        default: []
    },
    articles: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Articles',
        default: []
    }
}, { _id: false });



