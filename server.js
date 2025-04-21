import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import {setupDB} from "./config/db.js";
import authRouter from "./routers/authRouter.js";
import careerRouter from "./routers/careerRouter.js";
import userRouter from "./routers/userRouter.js";
import {authenticate} from "./middlewares/authenticate.js";

dotenv.config()
const app = express()
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser())
app.use(express.json());

app.use("/api/auth", authRouter)
app.use("/api/careers", careerRouter)
app.use("/api/user", authenticate, userRouter)
app.use((req, res) => {
  res.status(404).json({ message: "unexpected route" })
})

app.use((err, req, res, next) => {
  res.status(500).json({message: `Unfortunately, we have some errors here (${err})`})
})

setupDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`🚀 server is running on port ${process.env.PORT}`)
    })
  })
