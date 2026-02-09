import mongoose, { Schema, Document } from "mongoose";

interface ISpan {
    spanId: string;
    parentSpanId?: string;
    name: string;
    startTime: number;
    endTime: number;
}

export interface ITrace extends Document {
    traceId: string;
    service: string;
    spans: ISpan[];
    timestamp: Date;
}

const SpanSchema = new Schema({
    spanId: { type: String, required: true },
    parentSpanId: { type: String },
    name: { type: String, required: true },
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true },
});

const TraceSchema: Schema = new Schema({
    traceId: { type: String, required: true, unique: true, index: true },
    service: { type: String, required: true, index: true },
    spans: [SpanSchema],
    timestamp: { type: Date, default: Date.now, index: true },
});

export const Trace = mongoose.model<ITrace>("Trace", TraceSchema);
