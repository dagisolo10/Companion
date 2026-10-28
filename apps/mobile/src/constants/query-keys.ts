export const queryKeys = {
    user: {
        me: (userId?: string) => ["user", "me", userId] as const,
    },
};

export const queryRoots = {
    user: ["user"] as const,
};
