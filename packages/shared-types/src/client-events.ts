export interface WatchPartyEvent {
    code: string;
}

export interface WatchQuestEvent {
    questId: string;
    partyCode: string;
}

export interface ClientToServerEvents {
    "party:watch": (event: WatchPartyEvent) => void;
    "quest:watch": (event: WatchQuestEvent) => void;
    "party:unwatch": (event: WatchPartyEvent) => void;
    "quest:unwatch": (event: WatchQuestEvent) => void;
    "client:ping": (event: { sentAt: number }) => void;
}
