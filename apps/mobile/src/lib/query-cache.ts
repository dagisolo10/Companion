import type { Party, PartyDetail, PartyMember, Quest, QuestDetail, User } from "@/types/models";
import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type { PartyLeaderboardMember } from "@/types/leaderboard";
import { queryKeys, queryRoots } from "@/constants/query-keys";


function isQuestDetailKey(key: QueryKey) {
    return key.length === 3 && key[0] === "quest" && key[1] !== "my" && key[1] !== "party";
}

function isPartyDetailKey(key: QueryKey) {
    return key.length === 2 && key[0] === "party" && key[1] !== "my" && key[1] !== "all";
}

function matchesStatusFilter(statusFilter: unknown, quest: Quest) {
    return typeof statusFilter !== "string" || statusFilter === "All" || statusFilter === quest.status;
}

function applyQuestToList(list: Quest[], quest: Quest, statusFilter: unknown, take: unknown, prependWhenMissing: boolean) {
    const exists = list.some((item) => item.id === quest.id);

    if (!matchesStatusFilter(statusFilter, quest)) {
        return exists ? list.filter((item) => item.id !== quest.id) : list;
    }

    const limit = typeof take === "number" ? take : undefined;

    if (exists) {
        const next = list.map((item) => (item.id === quest.id ? { ...item, ...quest } : item));
        return limit ? next.slice(0, limit) : next;
    }

    if (!prependWhenMissing) return list;

    const next = [quest, ...list];
    return limit ? next.slice(0, limit) : next;
}

export function mergeQuestDetail(previous: QuestDetail | undefined, quest: Quest): QuestDetail {
    return previous ? { ...previous, ...quest, questActivities: previous.questActivities } : { ...quest, questActivities: [] };
}

export async function updateQuestCaches(queryClient: QueryClient, quest: Quest, options: { prependWhenMissing?: boolean; updateDetail?: boolean } = {}) {
    const { prependWhenMissing = false, updateDetail = true } = options;

    if (updateDetail) {
        queryClient.setQueryData<QuestDetail>(queryKeys.quest.byId(quest.id, quest.party.code), (previous) => mergeQuestDetail(previous, quest));
    }

    for (const [key, list] of queryClient.getQueriesData<Quest[]>({ queryKey: [...queryRoots.quest, "my"] })) {
        if (!list) continue;

        const next = applyQuestToList(list, quest, key[2], key[3], prependWhenMissing);
        queryClient.setQueryData(key, next);

        const wasRemoved = list.some((item) => item.id === quest.id) && !next.some((item) => item.id === quest.id);
        if (wasRemoved && typeof key[3] === "number") {
            await queryClient.invalidateQueries({ queryKey: key });
        }
    }

    for (const [key, list] of queryClient.getQueriesData<Quest[]>({ queryKey: [...queryRoots.quest, "party"] })) {
        if (!list) continue;
        if (key[2] !== quest.party.code) continue;
        queryClient.setQueryData(key, applyQuestToList(list, quest, key[3], undefined, prependWhenMissing));
    }

    await queryClient.invalidateQueries({ queryKey: ["paginated", ...queryRoots.quest] });
}

function removeQuestsByParty(queryClient: QueryClient, code: string) {
    for (const [key, list] of queryClient.getQueriesData<Quest[]>({ queryKey: [...queryRoots.quest, "my"] })) {
        if (!list) continue;
        queryClient.setQueryData(
            key,
            list.filter((quest) => quest.party.code !== code),
        );
    }

    for (const query of queryClient.getQueryCache().findAll({ queryKey: queryRoots.quest })) {
        const key = query.queryKey;
        const isPartyQuestList = key[1] === "party" && key[2] === code;
        const isQuestDetail = isQuestDetailKey(key) && key[2] === code;

        if (isPartyQuestList || isQuestDetail) {
            queryClient.removeQueries({ queryKey: key });
        }
    }
}

function findPartyByCode(queryClient: QueryClient, code: string) {
    const direct = queryClient.getQueryData<PartyDetail>(queryKeys.party.byCode(code));
    if (direct) return direct;

    for (const [, list] of queryClient.getQueriesData<PartyDetail[]>({ queryKey: [...queryRoots.party, "all"] })) {
        const match = list?.find((party) => party.code === code);
        if (match) return match;
    }

    return undefined;
}

function adjustPartyMemberCount(queryClient: QueryClient, code: string, delta: number, isMember?: boolean) {
    queryClient.setQueryData<PartyDetail>(queryKeys.party.byCode(code), (previous) =>
        previous
            ? {
                  ...previous,
                  isMember: isMember ?? previous.isMember,
                  _count: { ...previous._count, members: Math.max(0, previous._count.members + delta) },
              }
            : previous,
    );

    queryClient.setQueriesData<PartyDetail[]>({ queryKey: [...queryRoots.party, "all"] }, (list) =>
        list?.map((party) =>
            party.code === code
                ? {
                      ...party,
                      isMember: isMember ?? party.isMember,
                      _count: { ...party._count, members: Math.max(0, party._count.members + delta) },
                  }
                : party,
        ),
    );
}

export async function createPartyCaches(queryClient: QueryClient, party: Party) {
    const detail: PartyDetail = { ...party, _count: { members: 1 }, isMember: true };

    queryClient.setQueryData(queryKeys.party.byCode(party.code), detail);

    queryClient.setQueriesData<PartyDetail[]>({ queryKey: queryKeys.party.my() }, (list) => {
        if (!list) return list;
        return list.some((item) => item.id === party.id) ? list.map((item) => (item.id === party.id ? detail : item)) : [detail, ...list];
    });

    for (const [key, list] of queryClient.getQueriesData<PartyDetail[]>({ queryKey: [...queryRoots.party, "all"] })) {
        if (!list) continue;

        const query = typeof key[2] === "string" ? key[2].toLowerCase() : undefined;
        const matchesQuery = !query || party.name.toLowerCase().includes(query) || party.code.toLowerCase().includes(query);

        const next = list.some((item) => item.id === party.id) ? list.map((item) => (item.id === party.id ? detail : item)) : matchesQuery ? [detail, ...list] : list;

        queryClient.setQueryData(key, next);
    }
    await queryClient.invalidateQueries({ queryKey: ["paginated", ...queryRoots.party] });
}

export async function updatePartyCaches(queryClient: QueryClient, party: Party) {
    queryClient.setQueryData<PartyDetail>(queryKeys.party.byCode(party.code), (previous) => (previous ? { ...previous, ...party } : previous));

    const apply = (list?: PartyDetail[]) => list?.map((item) => (item.id === party.id ? { ...item, ...party } : item));

    queryClient.setQueriesData<PartyDetail[]>({ queryKey: queryKeys.party.my() }, apply);
    queryClient.setQueriesData<PartyDetail[]>({ queryKey: [...queryRoots.party, "all"] }, apply);
    await queryClient.invalidateQueries({ queryKey: ["paginated", ...queryRoots.party] });
}

export async function regeneratePartyCaches(queryClient: QueryClient, party: Party) {
    const previousCodes = new Set<string>();
    let previousDetail: PartyDetail | undefined;

    for (const query of queryClient.getQueryCache().findAll({ queryKey: queryRoots.party })) {
        const key = query.queryKey;
        const data = query.state.data as PartyDetail | undefined;

        if (isPartyDetailKey(key) && data?.id === party.id) {
            previousCodes.add(key[1] as string);
            previousDetail = data;
        }
    }

    await updatePartyCaches(queryClient, party);

    if (previousDetail) {
        queryClient.setQueryData(queryKeys.party.byCode(party.code), { ...previousDetail, ...party });
    }

    for (const code of previousCodes) {
        if (code === party.code) continue;

        queryClient.removeQueries({ queryKey: queryKeys.party.byCode(code) });
        queryClient.removeQueries({ queryKey: queryKeys.party.search(code) });
        queryClient.removeQueries({ queryKey: queryKeys.party.leaderboard(code) });
        queryClient.removeQueries({ queryKey: queryKeys.partyMember.members(code) });
        removeQuestsByParty(queryClient, code);
    }
}

export async function joinPartyCaches(queryClient: QueryClient, code: string, member: PartyMember) {
    const members = queryClient.getQueryData<PartyMember[]>(queryKeys.partyMember.members(code));
    const user = findCurrentUser(queryClient);
    const leaderboard = queryClient.getQueryData<PartyLeaderboardMember[]>(queryKeys.party.leaderboard(code));

    if (user) {
        if (leaderboard) {
            queryClient.setQueryData<PartyLeaderboardMember[]>(queryKeys.party.leaderboard(code), (previous) => (previous?.some((item) => item.id === member.id) ? previous : [...(previous ?? []), { ...member, user }]));
        }

        if (members) {
            queryClient.setQueryData<PartyMember[]>(queryKeys.partyMember.members(code), (previous) => (previous?.some((item) => item.id === member.id) ? previous : [...(previous ?? []), { ...member, user: { id: user.id, name: user.name, username: user.username } }]));
        }
    } else {
        if (leaderboard) await queryClient.invalidateQueries({ queryKey: queryKeys.party.leaderboard(code) });
        if (members) await queryClient.invalidateQueries({ queryKey: queryKeys.partyMember.members(code) });
    }

    adjustPartyMemberCount(queryClient, code, 1, true);

    const detail = findPartyByCode(queryClient, code);
    if (detail) {
        queryClient.setQueriesData<PartyDetail[]>({ queryKey: queryKeys.party.my() }, (list) => {
            if (!list) return list;
            return list.some((item) => item.id === detail.id) ? list.map((item) => (item.id === detail.id ? detail : item)) : [detail, ...list];
        });
    } else if (queryClient.getQueryData<PartyDetail[]>(queryKeys.party.my())) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.party.my() });
    }

    await queryClient.invalidateQueries({ queryKey: [...queryRoots.quest, "my"] });
    await queryClient.invalidateQueries({ queryKey: ["paginated", ...queryRoots.partyMember] });
}

export async function leavePartyCaches(queryClient: QueryClient, code: string) {
    const user = findCurrentUser(queryClient);
    const members = queryClient.getQueryData<PartyMember[]>(queryKeys.partyMember.members(code));
    const leaderboard = queryClient.getQueryData<PartyLeaderboardMember[]>(queryKeys.party.leaderboard(code));

    if (user) {
        if (members) queryClient.setQueryData<PartyMember[]>(queryKeys.partyMember.members(code), (previous) => previous?.filter((item) => item.userId !== user.id));
        if (leaderboard) queryClient.setQueryData<PartyLeaderboardMember[]>(queryKeys.party.leaderboard(code), (previous) => previous?.filter((item) => item.userId !== user.id));
    } else {
        if (members) await queryClient.invalidateQueries({ queryKey: queryKeys.partyMember.members(code) });
        if (leaderboard) await queryClient.invalidateQueries({ queryKey: queryKeys.party.leaderboard(code) });
    }

    adjustPartyMemberCount(queryClient, code, -1, false);
    queryClient.setQueriesData<PartyDetail[]>({ queryKey: queryKeys.party.my() }, (list) => list?.filter((party) => party.code !== code));
    removeQuestsByParty(queryClient, code);
    await queryClient.invalidateQueries({ queryKey: [...queryRoots.questActivity, "my"] });
    await queryClient.invalidateQueries({ queryKey: ["paginated", ...queryRoots.partyMember] });
}

export async function removePartyMemberCaches(queryClient: QueryClient, code: string, member: PartyMember) {
    queryClient.setQueryData<PartyMember[]>(queryKeys.partyMember.members(code), (previous) => previous?.filter((item) => item.id !== member.id));
    queryClient.setQueryData<PartyLeaderboardMember[]>(queryKeys.party.leaderboard(code), (previous) => previous?.filter((item) => item.id !== member.id && item.userId !== member.userId));
    adjustPartyMemberCount(queryClient, code, -1);
    await queryClient.invalidateQueries({ queryKey: ["paginated", ...queryRoots.partyMember] });
}

export async function deletePartyCaches(queryClient: QueryClient, party: Party) {
    queryClient.setQueriesData<PartyDetail[]>({ queryKey: queryKeys.party.my() }, (list) => list?.filter((item) => item.id !== party.id));
    queryClient.setQueriesData<PartyDetail[]>({ queryKey: [...queryRoots.party, "all"] }, (list) => list?.filter((item) => item.id !== party.id));
    queryClient.removeQueries({ queryKey: queryKeys.party.byCode(party.code) });
    queryClient.removeQueries({ queryKey: queryKeys.party.search(party.code) });
    queryClient.removeQueries({ queryKey: queryKeys.party.leaderboard(party.code) });
    queryClient.removeQueries({ queryKey: queryKeys.partyMember.members(party.code) });
    removeQuestsByParty(queryClient, party.code);
    await queryClient.invalidateQueries({ queryKey: [...queryRoots.questActivity, "my"] });
    await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
    await queryClient.invalidateQueries({ queryKey: ["paginated", ...queryRoots.party] });
}

export function findCurrentUser(queryClient: QueryClient) {
    for (const [, user] of queryClient.getQueriesData<User>({ queryKey: [...queryRoots.user, "me"] })) {
        if (user) return user;
    }

    return undefined;
}

function syncQuestUser(quest: Quest, user: User): Quest {
    return {
        ...quest,
        creator: { ...quest.creator, name: user.name, username: user.username },
    };
}

function syncQuestDetailUser(quest: QuestDetail, user: User): QuestDetail {
    return {
        ...syncQuestUser(quest, user),
        questActivities: (quest.questActivities ?? []).map((activity) => (activity.user?.id === user.id ? { ...activity, user: { ...activity.user, name: user.name, username: user.username } } : activity)),
    };
}

export async function syncUserCaches(queryClient: QueryClient, user: User) {
    queryClient.setQueryData<User>(queryKeys.user.me(user.id), user);

    queryClient.setQueriesData<User[]>({ queryKey: [...queryRoots.user, "search"] }, (list) => list?.map((item) => (item.id === user.id ? user : item)));
    queryClient.setQueriesData<User[]>({ queryKey: queryKeys.user.leaderboard() }, (list) => list?.map((item) => (item.id === user.id ? user : item)));
    queryClient.setQueryData<User>(queryKeys.user.other(user.username), user);
    queryClient.setQueryData<boolean>(queryKeys.user.username(user.username), true);
    await queryClient.invalidateQueries({ queryKey: ["paginated", ...queryRoots.user] });

    queryClient.setQueriesData<PartyMember[]>({ queryKey: queryRoots.partyMember }, (list) => list?.map((member) => (member.user.id === user.id ? { ...member, user: { id: user.id, name: user.name, username: user.username } } : member)));
    queryClient.setQueriesData<PartyLeaderboardMember[]>({ queryKey: [...queryRoots.party, "leaderboard"] }, (list) => list?.map((member) => (member.user.id === user.id ? { ...member, user } : member)));

    for (const [key, data] of queryClient.getQueriesData<Quest | QuestDetail | Quest[]>({ queryKey: queryRoots.quest })) {
        if (!data) continue;

        if (Array.isArray(data)) {
            queryClient.setQueryData(
                key,
                data.map((quest) => syncQuestUser(quest, user)),
            );
        } else {
            queryClient.setQueryData(key, syncQuestDetailUser(data as QuestDetail, user));
        }
    }
}
