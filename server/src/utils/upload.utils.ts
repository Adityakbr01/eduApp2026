import crypto from "crypto";


export const getPartSize = (fileSize: number) => {
    const MIN = 5 * 1024 * 1024; // 5MB (AWS rule)
    return Math.max(MIN, Math.ceil(fileSize / 10000));
};
