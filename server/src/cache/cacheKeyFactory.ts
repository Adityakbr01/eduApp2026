export const cacheKeyFactory = {
    user: {
        byId: (id: string) => `user:id:${id}`,
        activity: (id: string) => `user:activity:${id}`,
        all: () => `users:all`,
        paginated: (
            page: number,
            limit: number,
            search: string = "",
            roleId: string = ""
        ) => {
            const s = search || "";
            const r = roleId || "";
            return `users:page=${page}:limit=${limit}:search=${s}:role=${r}`;
        },
        permissions: (userId: string) => `user:permissions:${userId}`
        
    },
    session: {
        byUserId: (userId: string) => `session:user:${userId}`
    },
    role: {
        permissions: (roleId: string) => `role:permissions:${roleId}`,
        all: () => `roles:all`
    }
};
