import mongoose from "mongoose";
import { env } from "dotenv";
env.config();

import LessonContent from "./src/models/course/lessonContent.model.js";
import Quiz from "./src/models/course/quiz.model.js";

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find any lesson content that is a quiz
    const content = await LessonContent.findOne({ type: "quiz" }).populate("assessment.refId").lean();
    if(content) {
        console.log(JSON.stringify(content, null, 2));
    } else {
        console.log("No quiz content found");
    }
    
    process.exit(0);
}
run();
