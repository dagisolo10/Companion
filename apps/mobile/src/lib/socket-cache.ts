import type { Party, PartyDetail, PartyLeaderboardMember, PartyMember, Quest, QuestActivity, QuestDetail, QuestMemberCompletedEvent, User } from "@companion/shared-types";
import type { InfiniteData, QueryClient, QueryKey } from "@tanstack/react-query";
import type { PaginatedResult } from "@/types/response";
import { queryKeys, queryRoots } from "@/constants/query-keys";
import { migrateChatPartyCode, removeChatCaches, updateConversationParty } from "@/lib/chat-cache";
import { findCurrentUser } from "@/lib/query-cache";

function updateInfinite<T extends { id: string }>(queryClient: QueryClient, root: QueryKey, update: (items: T[]) => T[]) {
    for (const [key, data] of queryClient.getQueriesData<InfiniteData<PaginatedResult<T>>>({ queryKey: root })) {
        if (!data) continue;
        queryClient.setQueryData<InfiniteData<PaginatedResult<T>>>(key, {
            ...data,
            pages: data.pages.map((page) => ({ ...page, items: update(page.items) })),
        });
    }
}

function patchPartyLists(queryClient: QueryClient, party: Party, memberCount: number) {
    const update = (items?: PartyDetail[]) => items?.map((item) => (item.id === party.id ? { ...item, ...party, _count: { members: memberCount } } : item));
    queryClient.setQueriesData<PartyDetail[]>({ queryKey: queryKeys.party.my() }, update);
    queryClient.setQueriesData<PartyDetail[]>({ queryKey: [...queryRoots.party, "all"] }, update);
    updateInfinite<PartyDetail>(queryClient, ["paginated", ...queryRoots.party], (items) => items.map((item) => (item.id === party.id ? { ...item, ...party, _count: { members: memberCount } } : item)));
}

export function applyPartyUpdate(queryClient: QueryClient, party: Party, memberCount: number) {
    queryClient.setQueryData<PartyDetail>(queryKeys.party.byCode(party.code), (previous) =>
        previous
            ? {
                  ...previous,
                  ...party,
                  _count: { members: memberCount },
              }
            : previous,
    );
    patchPartyLists(queryClient, party, memberCount);
    updateConversationParty(queryClient, party);
}

export function applyPartyDelete(queryClient: QueryClient, partyId: string, partyCode: string) {
    queryClient.setQueriesData<PartyDetail[]>({ queryKey: queryKeys.party.my() }, (items) => items?.filter((party) => party.id !== partyId));
    queryClient.setQueriesData<PartyDetail[]>({ queryKey: [...queryRoots.party, "all"] }, (items) => items?.filter((party) => party.id !== partyId));
    updateInfinite<PartyDetail>(queryClient, ["paginated", ...queryRoots.party], (items) => items.filter((party) => party.id !== partyId));
    queryClient.removeQueries({ queryKey: queryKeys.party.byCode(partyCode) });
    queryClient.removeQueries({ queryKey: queryKeys.party.search(partyCode) });
    queryClient.removeQueries({ queryKey: queryKeys.party.leaderboard(partyCode) });
    queryClient.removeQueries({ queryKey: queryKeys.partyMember.members(partyCode) });
    queryClient.removeQueries({ queryKey: ["paginated", ...queryKeys.partyMember.members(partyCode)] });
    removeQuestsByParty(queryClient, partyCode);
    removeChatCaches(queryClient, partyCode);
    queryClient.setQueriesData<QuestActivity[]>({ queryKey: queryRoots.questActivity }, (activities) => activities?.filter((activity) => activity.quest.party.code !== partyCode));
    updateInfinite<QuestActivity>(queryClient, ["paginated", ...queryRoots.questActivity], (activities) => activities.filter((activity) => activity.quest.party.code !== partyCode));
}

export function applyPartyCodeChange(queryClient: QueryClient, previousCode: string, party: Party, memberCount: number) {
    const previous = queryClient.getQueryData<PartyDetail>(queryKeys.party.byCode(previousCode));
    if (previous) queryClient.removeQueries({ queryKey: queryKeys.party.byCode(previousCode) });
    queryClient.setQueryData<PartyDetail>(queryKeys.party.byCode(party.code), {
        ...party,
        _count: { members: memberCount },
        isMember: previous?.isMember ?? true,
    });
    patchPartyLists(queryClient, party, memberCount);
    queryClient.removeQueries({ queryKey: queryKeys.party.search(previousCode) });
    queryClient.removeQueries({ queryKey: queryKeys.party.leaderboard(previousCode) });
    queryClient.removeQueries({ queryKey: queryKeys.partyMember.members(previousCode) });
    queryClient.removeQueries({ queryKey: ["paginated", ...queryKeys.partyMember.members(previousCode)] });
    migrateQuestPartyCode(queryClient, previousCode, party);
    migrateChatPartyCode(queryClient, previousCode, party);
}

export function applyPartyMemberChange(queryClient: QueryClient, partyCode: string, memberCount: number, member: PartyMember, joined: boolean) {
    if (joined) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations() });
    } else if (findCurrentUser(queryClient)?.id === member.userId) {
        removeChatCaches(queryClient, partyCode);
    }

    queryClient.setQueryData<PartyDetail>(queryKeys.party.byCode(partyCode), (party) => (party ? { ...party, _count: { members: memberCount } } : party));
    queryClient.setQueriesData<PartyDetail[]>({ queryKey: queryKeys.party.my() }, (parties) => parties?.map((party) => (party.code === partyCode ? { ...party, _count: { members: memberCount } } : party)));
    queryClient.setQueriesData<PartyDetail[]>({ queryKey: [...queryRoots.party, "all"] }, (parties) => parties?.map((party) => (party.code === partyCode ? { ...party, _count: { members: memberCount } } : party)));

    const updateMembers = (members: PartyMember[]) => {
        const withoutMember = members.filter((existing) => existing.id !== member.id && existing.userId !== member.userId);
        return joined ? [...withoutMember, member] : withoutMember;
    };
    queryClient.setQueryData<PartyMember[]>(queryKeys.partyMember.members(partyCode), (members) => (members ? updateMembers(members) : members));
    for (const [key, data] of queryClient.getQueriesData<InfiniteData<PaginatedResult<PartyMember>>>({ queryKey: ["paginated", ...queryKeys.partyMember.members(partyCode)] })) {
        if (!data) continue;
        const existingPageIndex = data.pages.findIndex((page) => page.items.some((item) => item.id === member.id || item.userId === member.userId));
        const targetPageIndex = existingPageIndex >= 0 ? existingPageIndex : data.pages.length - 1;
        queryClient.setQueryData<InfiniteData<PaginatedResult<PartyMember>>>(key, {
            ...data,
            pages: data.pages.map((page, index) => {
                const items = page.items.filter((item) => item.id !== member.id && item.userId !== member.userId);
                return { ...page, items: joined && index === targetPageIndex ? [...items, member] : items };
            }),
        });
    }
}

export function applyLeaderboard(queryClient: QueryClient, partyCode: string, leaderboard: PartyLeaderboardMember[]) {
    queryClient.setQueryData(queryKeys.party.leaderboard(partyCode), leaderboard);
}

function removeQuestsByParty(queryClient: QueryClient, code: string) {
    for (const [key, quests] of queryClient.getQueriesData<Quest[]>({ queryKey: [...queryRoots.quest, "my"] })) {
        if (quests)
            queryClient.setQueryData(
                key,
                quests.filter((quest) => quest.party.code !== code),
            );
    }
    for (const query of queryClient.getQueryCache().findAll({ queryKey: queryRoots.quest })) {
        const key = query.queryKey;
        if ((key[1] === "party" && key[2] === code) || (key.length === 3 && key[2] === code)) queryClient.removeQueries({ queryKey: key });
    }
    updateInfinite<Quest>(queryClient, ["paginated", ...queryRoots.quest], (quests) => quests.filter((quest) => quest.party.code !== code));
}

function migrateQuestPartyCode(queryClient: QueryClient, previousCode: string, party: Party) {
    const update = (quest: Quest): Quest => (quest.party.code === previousCode ? { ...quest, party: { ...quest.party, code: party.code, name: party.name } } : quest);
    for (const [key, quests] of queryClient.getQueriesData<Quest[]>({ queryKey: [...queryRoots.quest, "my"] })) {
        if (quests) queryClient.setQueryData(key, quests.map(update));
    }
    for (const [key, quests] of queryClient.getQueriesData<Quest[]>({ queryKey: [...queryRoots.quest, "party"] })) {
        if (quests) queryClient.setQueryData(key, quests.map(update));
    }
    updateInfinite<Quest>(queryClient, ["paginated", ...queryRoots.quest], (quests) => quests.map(update));
    for (const [key, activities] of queryClient.getQueriesData<QuestActivity[]>({ queryKey: queryRoots.questActivity })) {
        if (activities)
            queryClient.setQueryData(
                key,
                activities.map((activity) => (activity.quest.party.code === previousCode ? { ...activity, quest: { ...activity.quest, party: { ...activity.quest.party, code: party.code, name: party.name } } } : activity)),
            );
    }
    updateInfinite<QuestActivity>(queryClient, ["paginated", ...queryRoots.questActivity], (activities) =>
        activities.map((activity) => (activity.quest.party.code === previousCode ? { ...activity, quest: { ...activity.quest, party: { ...activity.quest.party, code: party.code, name: party.name } } } : activity)),
    );
    for (const query of queryClient.getQueryCache().findAll({ queryKey: queryRoots.quest })) {
        const key = query.queryKey;
        if (key.length !== 3 || key[0] !== "quest" || key[1] === "my" || key[1] === "party" || key[2] !== previousCode) continue;
        const detail = query.state.data as QuestDetail | undefined;
        if (!detail) continue;
        queryClient.removeQueries({ queryKey: key });
        queryClient.setQueryData(queryKeys.quest.byId(detail.id, party.code), { ...detail, party: { ...detail.party, code: party.code, name: party.name } });
    }
}

function applyQuestToList(list: Quest[], quest: Quest, statusFilter: unknown, addIfMissing: boolean) {
    const matches = typeof statusFilter !== "string" || statusFilter === "All" || statusFilter === quest.status;
    const exists = list.some((item) => item.id === quest.id);
    if (!matches) return list.filter((item) => item.id !== quest.id);
    if (exists) return list.map((item) => (item.id === quest.id ? { ...item, ...quest } : item));
    return addIfMissing ? [quest, ...list] : list;
}

export function applyQuestChange(queryClient: QueryClient, quest: Quest, addIfMissing = false) {
    queryClient.setQueryData<QuestDetail>(queryKeys.quest.byId(quest.id, quest.party.code), (previous) =>
        previous
            ? {
                  ...previous,
                  ...quest,
                  questActivities: previous.questActivities,
              }
            : previous,
    );
    for (const [key, data] of queryClient.getQueriesData<Quest[]>({ queryKey: [...queryRoots.quest, "my"] })) {
        if (data) queryClient.setQueryData(key, applyQuestToList(data, quest, key[2], addIfMissing));
    }
    for (const [key, data] of queryClient.getQueriesData<Quest[]>({ queryKey: [...queryRoots.quest, "party"] })) {
        if (data && key[2] === quest.party.code) queryClient.setQueryData(key, applyQuestToList(data, quest, key[3], addIfMissing));
    }
    for (const [key, data] of queryClient.getQueriesData<InfiniteData<PaginatedResult<Quest>>>({ queryKey: ["paginated", ...queryRoots.quest] })) {
        if (!data) continue;
        const isMyQuestList = key[2] === "my";
        const isPartyQuestList = key[2] === "party" && key[3] === quest.party.code;
        if (!isMyQuestList && !isPartyQuestList) continue;
        const statusFilter = isMyQuestList ? key[3] : key[4];
        queryClient.setQueryData<InfiniteData<PaginatedResult<Quest>>>(key, {
            ...data,
            pages: data.pages.map((page, index) => ({
                ...page,
                items: applyQuestToList(page.items, quest, statusFilter, addIfMissing && index === 0),
            })),
        });
    }
}

export function applyQuestCompletion(queryClient: QueryClient, event: QuestMemberCompletedEvent) {
    applyQuestChange(queryClient, event.quest);
    queryClient.setQueryData<QuestDetail>(queryKeys.quest.byId(event.quest.id, event.quest.party.code), (previous) => {
        if (!previous) return previous;
        const alreadyAdded = previous.questActivities.some((activity) => activity.id === event.activity.id);
        return {
            ...previous,
            ...event.quest,
            questActivities: alreadyAdded ? previous.questActivities : [{ id: event.activity.id, completedAt: event.activity.completedAt, user: event.activity.user }, ...previous.questActivities],
        };
    });
}

export function applyUserUpdate(queryClient: QueryClient, user: User) {
    queryClient.setQueryData(queryKeys.user.me(user.id), user);
    queryClient.setQueryData(queryKeys.user.other(user.username), user);
    queryClient.setQueriesData<User[]>({ queryKey: [...queryRoots.user, "search"] }, (users) => users?.map((item) => (item.id === user.id ? user : item)));
    queryClient.setQueriesData<User[]>({ queryKey: queryKeys.user.leaderboard() }, (users) => users?.map((item) => (item.id === user.id ? user : item)));
    updateInfinite<User>(queryClient, ["paginated", ...queryRoots.user], (users) => users.map((item) => (item.id === user.id ? user : item)));
    queryClient.setQueriesData<PartyMember[]>({ queryKey: queryRoots.partyMember }, (members) => members?.map((member) => (member.userId === user.id ? { ...member, user: { id: user.id, name: user.name, username: user.username } } : member)));
    updateInfinite<PartyMember>(queryClient, ["paginated", ...queryRoots.partyMember], (members) => members.map((member) => (member.userId === user.id ? { ...member, user: { id: user.id, name: user.name, username: user.username } } : member)));
    queryClient.setQueriesData<PartyLeaderboardMember[]>({ queryKey: [...queryRoots.party, "leaderboard"] }, (members) => members?.map((member) => (member.user.id === user.id ? { ...member, user } : member)));
    for (const [key, data] of queryClient.getQueriesData<Quest | QuestDetail | Quest[]>({ queryKey: queryRoots.quest })) {
        if (!data) continue;
        if (Array.isArray(data)) {
            queryClient.setQueryData(
                key,
                data.map((quest) => (quest.creatorId === user.id ? { ...quest, creator: { ...quest.creator, name: user.name, username: user.username } } : quest)),
            );
        } else {
            const questData = data as QuestDetail;
            queryClient.setQueryData(key, {
                ...questData,
                creator: questData.creatorId === user.id ? { ...questData.creator, name: user.name, username: user.username } : questData.creator,
                questActivities: questData.questActivities.map((activity) => (activity.user.id === user.id ? { ...activity, user: { ...activity.user, ...user } } : activity)),
            });
        }
    }
    updateInfinite<Quest>(queryClient, ["paginated", ...queryRoots.quest], (quests) => quests.map((quest) => (quest.creatorId === user.id ? { ...quest, creator: { ...quest.creator, name: user.name, username: user.username } } : quest)));
    queryClient.setQueriesData<QuestActivity[]>({ queryKey: queryRoots.questActivity }, (activities) => activities?.map((activity) => (activity.user.id === user.id ? { ...activity, user: { ...activity.user, name: user.name, username: user.username } } : activity)));
    updateInfinite<QuestActivity>(queryClient, ["paginated", ...queryRoots.questActivity], (activities) => activities.map((activity) => (activity.user.id === user.id ? { ...activity, user: { ...activity.user, name: user.name, username: user.username } } : activity)));
}
