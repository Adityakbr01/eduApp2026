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



