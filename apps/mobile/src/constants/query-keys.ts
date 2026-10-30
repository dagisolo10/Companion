import { useQueryClient } from "@tanstack/react-query";
import { Filter } from "@companion/shared-types";
import { useCallback } from "react";

export const queryRoots = {
    user: ["user"] as const,
    party: ["party"] as const,
    quest: ["quest"] as const,
    dashboard: ["dashboard"] as const,
    partyMember: ["party-member"] as const,
    questActivity: ["quest-activity"] as const,
};

export const queryKeys = {
    user: {
        leaderboard: () => [...queryRoots.user, "leaderboard"] as const,
        me: (userId?: string) => [...queryRoots.user, "me", userId] as const,
        search: (query: string) => [...queryRoots.user, "search", query] as const,
        other: (username: string) => [...queryRoots.user, "other", username] as const,
        username: (username: string) => [...queryRoots.user, "username", username] as const,
    },
    party: {
        my: () => [...queryRoots.party, "my"] as const,
        byCode: (code: string) => [...queryRoots.party, code] as const,
        all: (query?: string) => [...queryRoots.party, "all", query] as const,
        search: (code: string) => [...queryRoots.party, "search", code] as const,
        leaderboard: (code: string) => [...queryRoots.party, "leaderboard", code] as const,
    },
    partyMember: {
        members: (code: string) => [...queryRoots.partyMember, "members", code] as const,
    },
    quest: {
        byId: (id: string, code: string) => [...queryRoots.quest, id, code] as const,
        my: (status?: Filter, take?: number) => [...queryRoots.quest, "my", status, take] as const,
        byParty: (code: string, status?: Filter) => [...queryRoots.quest, "party", code, status] as const,
    },
    questActivity: {
        my: (take?: number) => [...queryRoots.questActivity, "my", take] as const,
    },
    dashboard: () => queryRoots.dashboard,
};

export function useInvalidateAll() {
    const queryClient = useQueryClient();

    return useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: queryRoots.questActivity });
        await queryClient.invalidateQueries({ queryKey: queryRoots.dashboard });
        await queryClient.invalidateQueries({ queryKey: queryRoots.quest });
        await queryClient.invalidateQueries({ queryKey: queryRoots.party });
        await queryClient.invalidateQueries({ queryKey: queryRoots.user });
    }, [queryClient]);
}
