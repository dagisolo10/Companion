export const queryKeys = {
    user: {
        me: () => ["user", "me"],
        other: (username: string) => ["user", "other", username],
        username: (username: string) => ["user", "username", username],
    },
};
