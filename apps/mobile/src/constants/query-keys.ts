export const queryKeys = {
    user: {
        me: (userId?: string) => ["user", "me", userId],
        other: (username: string) => ["user", "other", username],
        username: (username: string) => ["user", "username", username],
    },
};
