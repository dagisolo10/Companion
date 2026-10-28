export const queryRoots = {
    user: ["user"] as const,
};

export const queryKeys = {
    user: {
        me: (userId?: string) => [...queryRoots.user, "me", userId] as const,
        username: (username: string) => [...queryRoots.user, "username", username] as const,
    },
};
