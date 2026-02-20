import mongoose from "mongoose";
import { env } from "dotenv";
env.config();
import Quiz from "./src/models/course/quiz.model.js";

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const quiz = await Quiz.findOne().lean();
    console.log(JSON.stringify(quiz, null, 2));
    process.exit(0);
}
run();
