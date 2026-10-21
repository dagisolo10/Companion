import { Filter } from "@/types/models";

export const queryKeys = {
    user: {
        me: (userId?: string) => ["user", "me", userId] as const,
        other: (username: string) => ["user", "other", username] as const,
        search: (query: string) => ["user", "search", query] as const,
        username: (username: string) => ["user", "username", username] as const,
        leaderboard: () => ["user", "leaderboard"] as const,
    },
    party: {
        my: () => ["party", "my"] as const,
        all: (query?: string) => ["party", "all", query] as const,
        byCode: (code: string) => ["party", code] as const,
        search: (code: string) => ["party", "search", code] as const,
        leaderboard: (code: string) => ["party", "leaderboard", code] as const,
    },
    partyMember: {
        members: (code: string) => ["party-member", "members", code] as const,
    },
    quest: {
        my: (status?: Filter) => ["quest", "my", status] as const,
        byParty: (code: string) => ["quest", "party", code] as const,
        byId: (id: string, code: string) => ["quest", id, code] as const,
    },
    questActivity: {
        my: () => ["quest-activity", "my"] as const,
    },
    dashboard: () => ["dashboard"] as const,
};

export const queryRoots = {
    user: ["user"] as const,
    party: ["party"] as const,
    partyMember: ["party-member"] as const,
    quest: ["quest"] as const,
    questActivity: ["quest-activity"] as const,
    dashboard: ["dashboard"] as const,
};

