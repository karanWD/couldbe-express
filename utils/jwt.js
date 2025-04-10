import jwt from "jsonwebtoken";

export const verifyJWT = (token) => {
    return jwt.verify(token, process.env.AUTH_TOKEN)
}
export const generateJWT = (payload) => {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {expiresIn: '7d'}
    )
}