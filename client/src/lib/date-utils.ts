
// Helper: Format Date object to "YYYY-MM-DDTHH:mm" for datetime-local input
export const toDateTimeLocal = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Helper: Get Tomorrow at 12:00 PM (Server Local Time)
export const getTomorrowNoon = () => {
    const now = new Date();

    const tomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1, // +1 day
        12, 0, 0, 0        // 12:00 PM
    );

    return tomorrow;
};


export const getFutureDate = (days: number) => {
    const now = new Date();

    const futureDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + days, // +1 day
        12, 0, 0, 0        // 12:00 PM
    );

    return futureDate;
};

