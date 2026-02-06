
import { emailCampaignService } from "src/services/emailCampaign.service.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";

/**
 * @route   POST /api/campaigns
 * @desc    Create a new email campaign
 * @access  Private (Admin/Manager)
 */
export const createCampaign = catchAsync(async (req, res) => {
    const userId = req.user.id;

    const campaign = await emailCampaignService.createCampaign({
        ...req.body,
        createdBy: userId,
    });

    sendResponse(res, 201, "Campaign created successfully", campaign);
});

/**
 * @route   GET /api/campaigns
 * @desc    Get all campaigns with filters
 * @access  Private (Admin/Manager)
 */
export const getCampaigns = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { status, page, limit } = req.query;

    const result = await emailCampaignService.getCampaigns({
        status: status as any,
        createdBy: userId,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
    });

    sendResponse(res, 200, "Campaigns retrieved successfully", result);
});

/**
 * @route   GET /api/campaigns/:id
 * @desc    Get campaign by ID
 * @access  Private (Admin/Manager)
 */
export const getCampaign = catchAsync(async (req, res) => {
    const { id } = req.params;

    const campaign = await emailCampaignService.getCampaign(id);

    sendResponse(res, 200, "Campaign retrieved successfully", campaign);
});

/**
 * @route   PUT /api/campaigns/:id
 * @desc    Update campaign (draft only)
 * @access  Private (Admin/Manager)
 */
export const updateCampaign = catchAsync(async (req, res) => {
    const { id } = req.params;

    const campaign = await emailCampaignService.updateCampaign(id, req.body);

    sendResponse(res, 200, "Campaign updated successfully", campaign);
});

/**
 * @route   POST /api/campaigns/:id/send
 * @desc    Send or schedule campaign
 * @access  Private (Admin/Manager)
 */
export const sendCampaign = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { scheduledAt } = req.body;

    const campaign = await emailCampaignService.sendCampaign(
        id,
        scheduledAt ? new Date(scheduledAt) : undefined
    );

    sendResponse(
        res,
        200,
        scheduledAt ? "Campaign scheduled successfully" : "Campaign sent successfully",
        campaign
    );
});

/**
 * @route   POST /api/campaigns/:id/cancel
 * @desc    Cancel scheduled campaign
 * @access  Private (Admin/Manager)
 */
export const cancelCampaign = catchAsync(async (req, res) => {
    const { id } = req.params;

    const campaign = await emailCampaignService.cancelCampaign(id);

    sendResponse(res, 200, "Campaign cancelled successfully", campaign);
});

/**
 * @route   DELETE /api/campaigns/:id
 * @desc    Delete campaign (draft only)
 * @access  Private (Admin/Manager)
 */
export const deleteCampaign = catchAsync(async (req, res) => {
    const { id } = req.params;

    await emailCampaignService.deleteCampaign(id);

    sendResponse(res, 200, "Campaign deleted successfully", null);
});

/**
 * @route   GET /api/campaigns/:id/stats
 * @desc    Get campaign statistics
 * @access  Private (Admin/Manager)
 */
export const getCampaignStats = catchAsync(async (req, res) => {
    const { id } = req.params;

    const stats = await emailCampaignService.getCampaignStats(id);

    sendResponse(res, 200, "Statistics retrieved successfully", stats);
});
