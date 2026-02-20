import { CallbackFormData } from "../../../validators/callbackForm.schema";

interface CallbackResponse {
    success: boolean;
    message: string;
}

export const submitCallbackRequest = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data: CallbackFormData
): Promise<CallbackResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In a real app, you would send the data to your backend:
    // const response = await fetch('/api/callback-request', {
    //     method: 'POST',
    //     body: JSON.stringify(data),
    // });

    // Simulate random success/failure (90% success rate)
    if (Math.random() > 0.1) {
        return {
            success: true,
            message: "Your callback request has been submitted successfully!",
        };
    } else {
        throw new Error("Failed to submit request. Please try again.");
    }
};
