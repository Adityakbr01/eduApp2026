import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";
import aiService from "src/services/ai/ai.service.js";

/**
 * @route   POST /api/v1/ai/generate-email
 * @desc    Generate email content using AI
 * @access  Private (Admin/Manager)
 */
export const generateEmailContent = catchAsync(async (req, res) => {
    const {
        campaignType,
        targetAudience,
        tone,
        subject,
        keyPoints,
        additionalContext,
        brandName,
    } = req.body;

    const result = await aiService.generateEmailContent({
        campaignType,
        targetAudience,
        tone,
        subject,
        keyPoints,
        additionalContext,
        brandName,
    });

    sendResponse(res, 200, "Email content generated successfully", result);
});

/**
 * @route   POST /api/v1/ai/improve-email
 * @desc    Improve existing email content using AI
 * @access  Private (Admin/Manager)
 */
export const improveEmailContent = catchAsync(async (req, res) => {
    const { content, instruction } = req.body;

    const result = await aiService.improveEmailContent(content, instruction);

    sendResponse(res, 200, "Email content improved successfully", result);
});

/**
 * @route   POST /api/v1/ai/subject-suggestions
 * @desc    Generate email subject line suggestions
 * @access  Private (Admin/Manager)
 */
export const generateSubjectSuggestions = catchAsync(async (req, res) => {
    const { content, count } = req.body;

    const result = await aiService.generateSubjectSuggestions(content, count);

    sendResponse(res, 200, "Subject suggestions generated successfully", result);
});

export default {
    generateEmailContent,
    improveEmailContent,
    generateSubjectSuggestions,
};
