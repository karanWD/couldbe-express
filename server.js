import express from  "express"
import dotenv from "dotenv"
import cors from "cors"
import authRouter from "./routers/authRouter.js";
import {setupDB} from "./config/db.js";

dotenv.config()
const app = express()
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use("/api/auth",authRouter)

setupDB()
app.listen(process.env.PORT,()=>{
    console.log("🚀 server is running")
})