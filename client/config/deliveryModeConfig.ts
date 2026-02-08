const deliveryModeConfig: Record<string, { label: string; color: string }> = {
    Live: {
        label: "Live",
        color: "#FF2222",
    },
    Offline: {
        label: "Offline",
        color: "#2563EB", // blue
    },
    Recorded: {
        label: "Recorded",
        color: "#16A34A", // green
    },
    Hybrid: {
        label: "Hybrid",
        color: "#7C3AED", // purple
    },
};

export default deliveryModeConfig;
