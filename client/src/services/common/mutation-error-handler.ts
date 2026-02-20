// # this handler responsible for setting form errors from mutation errors
// services/common/mutation-error-handler.ts
import { AxiosError } from "axios";
import { FieldValues, UseFormSetError, Path } from "react-hook-form";
/**
 * Type-safe wrapper for react-hook-form setError
 */
export function handleMutationError<T extends FieldValues>(
    error: unknown,
    setError?: UseFormSetError<T>
) {
    if (!setError) return;

    // Axios error with backend validation structure
    if (error instanceof AxiosError && error.response?.data?.error) {
        const apiError = error.response.data.error;

        // Backend sends field-specific errors in 'details' array
        if (Array.isArray(apiError.details) && apiError.details.length > 0) {
            apiError.details.forEach((d: { path: string; message: string }) => {
                // Convert backend path to react-hook-form Path<T>
                const fieldPath = d.path as Path<T>;
                setError(fieldPath, {
                    type: "manual",
                    message: d.message,
                });
            });
        } else {
            // Global error fallback
            setError("root" as Path<T>, {
                type: "manual",
                message: apiError.message || "Something went wrong",
            });
        }
    } else if (error instanceof Error) {
        // Generic JS Error
        setError("root" as Path<T>, {
            type: "manual",
            message: error.message,
        });
    } else {
        // Fallback for unknown error type
        setError("root" as Path<T>, {
            type: "manual",
            message: "Something went wrong",
        });
    }
}
