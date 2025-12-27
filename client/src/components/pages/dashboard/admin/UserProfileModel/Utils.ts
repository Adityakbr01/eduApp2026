import { InfoItem } from "./UserInfoTab";

export const buildInfoItems = (
    email: string | null,
    roleNames: string[] | null,
    phone: string | null,
    approvalStatus: string | null,
    isEmailVerified: boolean | null
): InfoItem[] => {
    return [
        {
            label: "Email",
            value: email || "—",
        },
        {
            label: "Roles",
            value: roleNames?.length ? roleNames.join(", ") : "—",
        },
        {
            label: "Phone",
            value: phone || "—",
        },
        {
            label: "Approval Status",
            value: approvalStatus || "—",
        },
        {
            label: "Email Verified",
            value: isEmailVerified ? "Yes" : "No",
        },
    ];
};



export const uniqueList = (values?: (string | null | undefined)[]) => {
    if (!values) return [];
    const filtered = values.filter((value): value is string => Boolean(value));
    return Array.from(new Set(filtered));
};