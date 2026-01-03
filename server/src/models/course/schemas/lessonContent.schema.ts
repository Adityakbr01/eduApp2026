// import { Schema } from "mongoose";
// import type { ILessonContent } from "../../../types/course.type.js";
// import { ContentType } from "../../../types/course.type.js";

// // Lesson Content Schema
// // Each lesson can have multiple contents: video, pdf, quiz, text, audio, assignment
// export const LessonContentSchema = new Schema<ILessonContent>(
//     {
//         type: {
//             type: String,
//             enum: Object.values(ContentType),
//             required: true,
//         },
//         title: { type: String, required: true },
//         url: { type: String }, // For video, pdf, audio files
//         textContent: { type: String }, // For text content or assignment instructions
//         isPreview: { type: Boolean, default: false }, // Allow preview without enrollment
//         order: { type: Number, required: true, default: 0 },
//     },
//     { _id: true }
// );
