import mongoose, { Schema, Document } from "mongoose";

export interface IMetricAgg extends Document {
    windowStart: Date;
    windowSize: string; // e.g., '1m'
    service: string;
    path: string;
    count: number;
    errorCount: number;
    avgLatencyMs: number;
    p95LatencyMs: number;
    errorRate: number;
}

const MetricAggSchema: Schema = new Schema({
    windowStart: { type: Date, required: true, index: true },
    windowSize: { type: String, required: true },
    service: { type: String, required: true, index: true },
    path: { type: String, required: true, index: true },
    count: { type: Number, required: true },
    errorCount: { type: Number, required: true },
    avgLatencyMs: { type: Number, required: true },
    p95LatencyMs: { type: Number, required: true },
    errorRate: { type: Number, required: true },
});

// Compound index for fast lookup
MetricAggSchema.index({ windowStart: 1, service: 1, path: 1 });

export const MetricAgg = mongoose.model<IMetricAgg>("MetricAgg", MetricAggSchema);
