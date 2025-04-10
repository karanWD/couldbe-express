import {Schema,model} from "mongoose";

const CareersModel = new Schema({
    title:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    }
})

export default model("Careers",CareersModel)