import type { NextFunction, Request, Response } from "express";
import LiveStreamAccessRequest from "src/models/course/liveStreamAccessRequest.model.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";

import logger from "src/utils/logger.js";
import AppError from "src/utils/AppError.js";

// ==================== INSTRUCTOR CONTROLLERS ====================

/**
 * POST /api/v1/live-streams/access-request
 * Instructor requests access to VdoCipher dashboard
 */
export const requestLiveStreamAccess = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
        const instructorId = req.user!.id;

        // Check if a request already exists
        const existingRequest = await LiveStreamAccessRequest.findOne({ instructorId });

        if (existingRequest) {
            // If it was rejected, they are allowed to request again.
            if (existingRequest.status === "rejected") {
                existingRequest.status = "pending";
                await existingRequest.save();

                logger.info("✅ Live stream access RE-requested", { instructorId });
                return sendResponse(res, 200, "Access request resubmitted", existingRequest);
            }

            return sendResponse(
                res,
                400,
                "Request already exists",
                undefined,
                { code: "ALREADY_EXISTS" }
            );
        }

        const newRequest = await LiveStreamAccessRequest.create({
            instructorId,
            status: "pending",
        });

        logger.info("✅ Live stream access requested", { instructorId });

        return sendResponse(res, 201, "Access request submitted", newRequest);
    }
);

/**
 * GET /api/v1/live-streams/access-request/status
 * Instructor checks their request status
 */
export const getLiveStreamAccessStatus = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
        const instructorId = req.user!.id;

        const accessRequest = await LiveStreamAccessRequest.findOne({ instructorId });

        const status = accessRequest ? accessRequest.status : "none";

        return sendResponse(res, 200, "Access status fetched", { status });
    }
);

// ==================== ADMIN CONTROLLERS ====================

/**
 * GET /api/v1/live-streams/admin/access-requests
 * Admin lists all pending/approved access requests
 */
export const listAccessRequests = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
        const { status, page = 1, limit = 10 } = req.query;

        const filter: any = {};
        if (status) filter.status = status;

        const skip = (Number(page) - 1) * Number(limit);

        const requests = await LiveStreamAccessRequest.find(filter)
            .populate("instructorId", "name email")
            .populate("processedBy", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await LiveStreamAccessRequest.countDocuments(filter);

        return sendResponse(res, 200, "Access requests fetched", {
            requests,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            }
        });
    }
);

/**
 * PATCH /api/v1/live-streams/admin/access-requests/:id
 * Admin approves or rejects a request
 */
export const processAccessRequest = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
        const adminId = req.user!.id;
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        if (!["approved", "rejected"].includes(status)) {
            throw new AppError("Invalid status", 400);
        }

        const accessRequest = await LiveStreamAccessRequest.findById(id);

        if (!accessRequest) {
            throw new AppError("Request not found", 404);
        }

        accessRequest.status = status;
        accessRequest.processedBy = adminId as any;
        accessRequest.processedAt = new Date();

        await accessRequest.save();

        logger.info(`✅ Live stream access request ${status}`, {
            requestId: id,
            adminId,
            instructorId: accessRequest.instructorId,
        });

        return sendResponse(res, 200, `Access request ${status}`, accessRequest);
    }
);
