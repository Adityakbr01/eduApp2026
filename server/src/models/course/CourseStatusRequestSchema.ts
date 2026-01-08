// models/CourseStatusRequest.ts
import { Schema, model, Types } from "mongoose";
import { CourseStatus } from "src/types/course.type.js";

const CourseStatusRequestSchema = new Schema({
    course: { type: Types.ObjectId, ref: "Course", required: true },
    instructor: { type: Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: [CourseStatus.PUBLISHED, CourseStatus.UNPUBLISHED], required: true },
    status: { type: String, enum: [CourseStatus.PENDING_REVIEW, CourseStatus.APPROVED, CourseStatus.REJECTED], default: CourseStatus.PENDING_REVIEW },
    reason: { type: String }, // Optional rejection reason
    createdAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    admin: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: false,
  }, // Who approved/rejected
});

export default model("CourseStatusRequest", CourseStatusRequestSchema);
