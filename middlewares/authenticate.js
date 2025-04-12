import {verifyJWT} from "../utils/jwt.js";

export const authenticate = async (req, res, next) => {
  try {
    const {token} = req.cookies
    if (!token) {
      return res.status(401).json({message: "invalid credential"})
    }
    const {id} = await verifyJWT(token)
    req.userData = {id}
    next()
  } catch (e) {
    console.log(e.message)
    return res.status(401).json({message: `invalid credential:${e.message}`})
  }
}