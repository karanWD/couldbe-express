import mongoose from "mongoose";

const {Schema,model} = mongoose

const CharactersSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    statement:{
        type:String,
        required:true
    }
})

export default model("Characters",CharactersSchema)