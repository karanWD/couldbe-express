import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import {emailValidator, passwordValidator, requiredValidator} from "../utils/validators.js";
import {hashPassword} from "../utils/hashPassword.js";
import {generateJWT} from "../utils/jwt.js";

export const login = async (req, res) => {
  try {
    const {email, password} = req.body;
    if (!email || !emailValidator(email) || !password) {
      return res.status(400).json({message: 'email and password are required'});
    }
    const user = await User.findOne({email});
    if (!user) {
      return res.status(401).json({message: 'email is not correct'});
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({message: 'invalid password'});
    }
    const token = generateJWT({id: user._id})

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.status(200).json({message: 'login successfully'});

  } catch (err) {
    console.error(err);
    res.status(500).json({message: 'server error'});
  }
}

export const signup = async (req, res) => {
  try {
    const missedField = await requiredValidator(req.body, ['first_name', 'last_name', 'email', 'password', 'birth_date', 'gender', 'place_of_residence'])
    if (missedField) {
      return res.status(400).json({message: missedField + " is required. "});
    }

    const {
      first_name,
      last_name,
      email,
      password,
      place_of_residence,
      birth_date,
      gender
    } = req.body;

    if (!emailValidator(email)) {
      return res.status(400).json({message: "email format is not acceptable"});
    }
    if (passwordValidator(password)) {
      return res.status(400).json({message: "password must be at least 8 characters"});
    }
    const existingUser = await User.findOne({email});
    if (existingUser) {
      return res.status(409).json({message: "the email is already exist"});
    }
    const hashedPassword = await hashPassword(password);
    const newUser = new User({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      birth_date: new Date(birth_date),
      place_of_residence,
      gender
    });

    await newUser.save();
    const token = generateJWT({id: newUser._id})

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.status(201).json({message: "signup successfully"});

  } catch (e) {
    return res.status(500).json({
      message: "server error" + e.message
    })
  }
}