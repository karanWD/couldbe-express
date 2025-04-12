import {Regexes} from "./regexes.js";

export const requiredValidator = (data,fields)=>{
    for (const item of fields){
        if (!data[item]){
            return item;
        }
    }
    return null
}

export const emailValidator = (email)=>{
    return Regexes.email.test(email)
}

export const passwordValidator = (password)=>{
    return password.length < 8
}