import type { QuestStatus } from "./models";


export interface PartyUpdatedEvent {
    code: string;
    name: string;
    public: boolean;
    memberCount: number;
}

export interface PartyMemberChangedEvent {
    code: string;
    name: string;
    userId: string;
    username: string;
    joinedAt: string;
}

export interface QuestUpdatedEvent {
    id: string;
    title: string;
    startsAt: string;
    partyCode: string;
    status: QuestStatus;
    expiresAt: string | null;
    completedAt: string | null;
}

export interface QuestActivityCreatedEvent {
    id: string;
    questId: string;
    partyCode: string;
    userId: string;
    completedAt: string;
    xpAwarded: number;
}

export interface ServerToClientEvents {
    connection_error: (error: string) => void;
    "quest:updated": (event: QuestUpdatedEvent) => void;
    "party:updated": (event: PartyUpdatedEvent) => void;
    "connection:ready": (event: { userId: string }) => void;
    "party:member-joined": (event: PartyMemberChangedEvent) => void;
    "quest:activity-created": (event: QuestActivityCreatedEvent) => void;
    "client:pong": (event: { sentAt: number; receivedAt: number }) => void;
    "party:member-left": (event: Pick<PartyMemberChangedEvent, "code" | "userId">) => void;
}
