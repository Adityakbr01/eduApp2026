import mongoose, { Schema, Document } from "mongoose";

export interface ILog extends Document {
    timestamp: Date;
    service: string;
    env: string;
    method: string;
    path: string;
    statusCode: number;
    latencyMs: number;
    traceId?: string;
    spanId?: string;
    userId?: string;
    level: string;
    message: string;
    meta?: any;
}

const LogSchema: Schema = new Schema({
    timestamp: { type: Date, default: Date.now, index: true },
    service: { type: String, required: true, index: true },
    env: { type: String, required: true },
    method: { type: String, required: true },
    path: { type: String, required: true },
    statusCode: { type: Number, required: true },
    latencyMs: { type: Number, required: true },
    traceId: { type: String, index: true },
    spanId: { type: String },
    userId: { type: String },
    level: { type: String, required: true, enum: ['info', 'error', 'warn', 'debug'] },
    message: { type: String },
    meta: { type: Schema.Types.Mixed },
});

export const Log = mongoose.model<ILog>("Log", LogSchema);
