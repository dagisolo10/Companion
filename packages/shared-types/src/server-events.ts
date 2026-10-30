import type { Party, PartyMember, Quest, QuestCompleter, User } from "./models";


export interface PartyUpdatedEvent {
    party: Party;
    memberCount: number;
}

export interface PartyMemberChangedEvent {
    partyCode: string;
    partyName: string;
    member: PartyMember;
    memberCount: number;
}

export interface PartyCodeRegeneratedEvent {
    previousCode: string;
    party: Party;
    memberCount: number;
}

export interface PartyDeletedEvent {
    partyId: string;
    partyCode: string;
}

export interface UserUpdatedEvent {
    user: User;
}

export interface QuestChangedEvent {
    partyCode: string;
    quest: Quest;
}

export interface QuestLifecycleEvent {
    partyCode: string;
    quest: Quest;
    hoursRemaining?: 1 | 2;
}

export interface QuestMemberCompletedEvent {
    partyCode: string;
    quest: Quest;
    activity: { id: string; questId: string; userId: string; xpAwarded: number; completedAt: string; user: QuestCompleter };
}

export type PartyLeaderboardMember = PartyMember & { user: User };

export interface PartyLeaderboardUpdatedEvent {
    partyCode: string;
    leaderboard: PartyLeaderboardMember[];
}

export interface ServerToClientEvents {
    "user:updated": (event: UserUpdatedEvent) => void;
    "party:updated": (event: PartyUpdatedEvent) => void;
    "party:deleted": (event: PartyDeletedEvent) => void;
    "quest:created": (event: QuestChangedEvent) => void;
    "quest:updated": (event: QuestChangedEvent) => void;
    "quest:started": (event: QuestLifecycleEvent) => void;
    "quest:expired": (event: QuestLifecycleEvent) => void;
    "quest:expiring": (event: QuestLifecycleEvent) => void;
    "quest:completed": (event: QuestLifecycleEvent) => void;
    "party:member-left": (event: PartyMemberChangedEvent) => void;
    "party:member-joined": (event: PartyMemberChangedEvent) => void;
    "party:code-regenerated": (event: PartyCodeRegeneratedEvent) => void;
    "quest:member-completed": (event: QuestMemberCompletedEvent) => void;
    "party:leaderboard-updated": (event: PartyLeaderboardUpdatedEvent) => void;
}
