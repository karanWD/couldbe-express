import mongoose, {Schema} from "mongoose";

export const CoursesSchema = new Schema({
    books: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Books',
        default: []
    },
    video: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Videos',
        default: []
    },
    article: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Articles',
        default: []
    }
}, { _id: false });



