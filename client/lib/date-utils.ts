
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

// Helper: Get Today at 12:00 PM
export const getTodayNoon = () => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    return date;
};

// Helper: Get Tomorrow at 12:00 PM
export const getTomorrowNoon = () => {
    const date = getTodayNoon();
    date.setDate(date.getDate() + 1);
    return date;
};
