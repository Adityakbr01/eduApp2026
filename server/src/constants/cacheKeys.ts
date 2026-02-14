export const CACHE_KEYS = {
    USER: {
        BY_ID: (id: string) => `user:${id}`,
        LIST: (page: number, limit: number) =>
            `users:list:page=${page}:limit=${limit}`,
    },

    AUTH: {
        TOKEN: (token: string) => `auth:token:${token}`,
    },
};




const DATA_TTL = 60 * 60 * 24; // 24 hours (for structure)
const USER_TTL = 60 * 60 * 24 * 7; // 7 days (for progress)