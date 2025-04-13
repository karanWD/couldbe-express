import mongoose from "mongoose";

const {Schema,model} = mongoose

const CharactersSchema = new Schema({
    problemSolving:{
        type:String,
        required:true,
        enum:["High","Medium","Low"]
    },
    leadership:{
        type:String,
        required:true,
        enum:["High","Medium","Low"]
    },
    selfManagement:{
        type:String,
        required:true,
        enum:["High","Medium","Low"]
    },
    technology:{
        type:String,
        required:true,
        enum:["High","Medium","Low"]
    },
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