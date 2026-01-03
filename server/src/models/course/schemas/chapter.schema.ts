// import { Schema } from "mongoose";
// import type { IChapter } from "../../../types/course.type.js";
// import { LessonSchema } from "./lesson.schema.js";

// // Chapter Schema
// // Each chapter contains MULTIPLE lessons
// export const ChapterSchema = new Schema<IChapter>(
//     {
//         title: { type: String, required: true },
//         description: { type: String },
//         // One chapter has MULTIPLE lessons
//         lessons: { type: [LessonSchema], default: [] },
//         order: { type: Number, required: true, default: 0 },
//         isPublished: { type: Boolean, default: false },
//     },
//     { _id: true }
// );
