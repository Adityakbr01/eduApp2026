import mongoose, { Schema, Document } from "mongoose";

export interface IMetricRaw extends Document {
    timestamp: Date;
    service: string;
    path: string;
    statusCode: number;
    latencyMs: number;
}

const MetricRawSchema: Schema = new Schema({
    timestamp: { type: Date, default: Date.now, index: true },
    service: { type: String, required: true, index: true },
    path: { type: String, required: true, index: true },
    statusCode: { type: Number, required: true },
    latencyMs: { type: Number, required: true },
});

export const MetricRaw = mongoose.model<IMetricRaw>("MetricRaw", MetricRawSchema);
