// import { Schema } from "mongoose";
// import type { ICurriculumSection } from "../../../types/course.type.js";
// import { TopicSchema } from "./topic.schema.js";

// // Curriculum Section Schema (simplified Chapter)
// // Each section contains topics (just text titles for syllabus display)
// export const CurriculumSectionSchema = new Schema<ICurriculumSection>(
//     {
//         title: { type: String, required: true },
//         description: { type: String },
//         // Topics are simple text items showing what's covered
//         topics: { type: [TopicSchema], default: [] },
//         order: { type: Number, required: true, default: 0 },
//     },
//     { _id: true }
// );
