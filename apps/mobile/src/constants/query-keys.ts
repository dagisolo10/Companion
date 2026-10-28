import { Filter } from "@/types/models";
import { useQueryClient } from "@tanstack/react-query";
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
        byParty: (code: string) => [...queryRoots.quest, "party", code] as const,
        byId: (id: string, code: string) => [...queryRoots.quest, id, code] as const,
        my: (status?: Filter, take?: number) => [...queryRoots.quest, "my", status, take] as const,
    },
    questActivity: {
        my: (take?: number) => [...queryRoots.questActivity, "my", take] as const,
    },
    dashboard: () => queryRoots.dashboard,
};

export function useInvalidateAll() {
    const queryClient = useQueryClient();

    return useCallback(() => {
        queryClient.invalidateQueries({ queryKey: queryRoots.questActivity });
        queryClient.invalidateQueries({ queryKey: queryRoots.dashboard });
        queryClient.invalidateQueries({ queryKey: queryRoots.quest });
        queryClient.invalidateQueries({ queryKey: queryRoots.party });
        queryClient.invalidateQueries({ queryKey: queryRoots.user });
    }, [queryClient]);
}
