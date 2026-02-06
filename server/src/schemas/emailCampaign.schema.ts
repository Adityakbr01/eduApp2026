import { z } from "zod";
import { CampaignStatus, RecipientType, CampaignPriority } from "src/models/emailCampaign.model.js";

/**
 * Create campaign schema
 */
export const createCampaignSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    subject: z.string().min(1, "Subject is required").max(200, "Subject too long"),
    content: z.string().min(1, "Content is required"),
    recipientType: z.nativeEnum(RecipientType),
    recipientIds: z.array(z.string()).optional(),
    priority: z.nativeEnum(CampaignPriority).default(CampaignPriority.NORMAL),
    tags: z.array(z.string()).optional(),
});

/**
 * Update campaign schema
 */
export const updateCampaignSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    subject: z.string().min(1).max(200).optional(),
    content: z.string().min(1).optional(),
    recipientType: z.nativeEnum(RecipientType).optional(),
    recipientIds: z.array(z.string()).optional(),
    priority: z.nativeEnum(CampaignPriority).optional(),
});

/**
 * Send campaign schema
 */
export const sendCampaignSchema = z.object({
    scheduledAt: z.string().datetime().optional(),
});

/**
 * Query campaigns schema
 */
export const queryCampaignsSchema = z.object({
    status: z.nativeEnum(CampaignStatus).optional(),
    page: z.string().regex(/^\d+$/).optional().transform(val => val ? Number(val) : 1),
    limit: z.string().regex(/^\d+$/).optional().transform(val => val ? Number(val) : 20),
});
