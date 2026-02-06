import { Router } from "express";
import {
    createCampaign,
    getCampaigns,
    getCampaign,
    updateCampaign,
    sendCampaign,
    cancelCampaign,
    deleteCampaign,
    getCampaignStats,
} from "src/controllers/emailCampaign.controller.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";
import { validateRequest } from "src/middlewares/custom/validateRequest.js";
import {
    createCampaignSchema,
    updateCampaignSchema,
    sendCampaignSchema,
    queryCampaignsSchema,
} from "src/schemas/emailCampaign.schema.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// TODO: Add role-based authorization middleware for Admin/Manager only

/**
 * @route   POST /api/campaigns
 * @desc    Create a new email campaign
 * @access  Private (Admin/Manager)
 */
router.post("/", validateRequest(createCampaignSchema), createCampaign);

/**
 * @route   GET /api/campaigns
 * @desc    Get all campaigns with filters
 * @access  Private (Admin/Manager)
 */
router.get("/", validateRequest(queryCampaignsSchema, "query"), getCampaigns);

/**
 * @route   GET /api/campaigns/:id
 * @desc    Get campaign by ID
 * @access  Private (Admin/Manager)
 */
router.get("/:id", getCampaign);

/**
 * @route   PUT /api/campaigns/:id
 * @desc    Update campaign (draft only)
 * @access  Private (Admin/Manager)
 */
router.put("/:id", validateRequest(updateCampaignSchema), updateCampaign);

/**
 * @route   POST /api/campaigns/:id/send
 * @desc    Send or schedule campaign
 * @access  Private (Admin/Manager)
 */
router.post("/:id/send", validateRequest(sendCampaignSchema), sendCampaign);

/**
 * @route   POST /api/campaigns/:id/cancel
 * @desc    Cancel scheduled campaign
 * @access  Private (Admin/Manager)
 */
router.post("/:id/cancel", cancelCampaign);

/**
 * @route   DELETE /api/campaigns/:id
 * @desc    Delete campaign (draft only)
 * @access  Private (Admin/Manager)
 */
router.delete("/:id", deleteCampaign);

/**
 * @route   GET /api/campaigns/:id/stats
 * @desc    Get campaign statistics
 * @access  Private (Admin/Manager)
 */
router.get("/:id/stats", getCampaignStats);

export default router;
