// # This util provides standardized success and error handling for mutations and displays toast notifications accordingly.
// services/common/mutation-utils.ts
import toast from "react-hot-toast";
import { normalizeApiError } from "../auth/error-utils";

export const mutationHandlers = {
    success(message?: string) {
        if (message) toast.success(message);
    },

    error(error: unknown, setFormError?: (e: Record<string, string>) => void) {
        const normalized = normalizeApiError(error);

        if (normalized.fieldErrors && setFormError) {
            setFormError(normalized.fieldErrors);
            return;
        }

        toast.error(normalized.message);
    },
};
