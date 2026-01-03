// import { Schema } from "mongoose";
// import type { ILesson } from "../../../types/course.type.js";
// import { LessonContentSchema } from "./lessonContent.schema.js";

// // Lesson Schema
// // Each lesson contains multiple contents (videos, pdfs, quizzes, etc.)
// export const LessonSchema = new Schema<ILesson>(
//     {
//         title: { type: String, required: true },
//         description: { type: String },
//         // One lesson has MULTIPLE lesson contents (video, pdf, quiz, etc.)
//         contents: { type: [LessonContentSchema], default: [] },
//         duration: { type: Number, default: 0 }, // Total duration in minutes
//         isPublished: { type: Boolean, default: false },
//         isFree: { type: Boolean, default: false }, // Free lesson without purchase
//         order: { type: Number, required: true, default: 0 },
//     },
//     { _id: true }
// );
