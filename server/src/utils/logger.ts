import path from "path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const { combine, timestamp, errors, printf, colorize, json } = winston.format;

const environment = process.env.NODE_ENV || "development";
const isProduction = environment === "production";

// Logs folder outside src (project root/logs)
const logsDir = path.join(process.cwd(), "logs");

/**
 * Dev-friendly console format
 */
const devFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});

/**
 * Production JSON format with structured data
 */
const prodFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
    const log = {
        timestamp,
        level,
        message: stack || message,
        ...(Object.keys(meta).length && { meta }),
    };
    return JSON.stringify(log);
});

/**
 * Create Winston Logger
 */
const logger = winston.createLogger({
    level: isProduction ? "info" : "debug",
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true })
    ),
    transports: [
        // Console logs (colorized for dev)
        new winston.transports.Console({
            format: combine(colorize({ all: true }), devFormat),
        }),

        // HTTP requests logs - logs/YYYY-MM-DD/http.log
        new DailyRotateFile({
            dirname: path.join(logsDir, "%DATE%"),
            filename: "http.log",
            datePattern: "YYYY-MM-DD",
            level: "http",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "30d",
            format: combine(timestamp(), isProduction ? prodFormat : devFormat),
        }),

        // Error logs - logs/YYYY-MM-DD/error.log
        new DailyRotateFile({
            dirname: path.join(logsDir, "%DATE%"),
            filename: "error.log",
            datePattern: "YYYY-MM-DD",
            level: "error",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "30d",
            format: combine(timestamp(), errors({ stack: true }), isProduction ? prodFormat : devFormat),
        }),

        // Combined logs - logs/YYYY-MM-DD/combined.log
        new DailyRotateFile({
            dirname: path.join(logsDir, "%DATE%"),
            filename: "combined.log",
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "30d",
            format: combine(timestamp(), isProduction ? prodFormat : devFormat),
        }),
    ],
    exitOnError: false,
});

export default logger;
