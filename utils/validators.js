import {Regexes} from "./regexes.js";

export const emailValidator = (email)=>{
    return Regexes.email.test(email)
}

export const passwordValidator = (password)=>{
    return password.length < 8
}