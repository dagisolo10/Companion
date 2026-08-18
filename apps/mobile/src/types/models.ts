export type User = {
    id: string;
    name: string;
    level: number;
    username: string;
    createdAt: string;
    experience: number;
};

export type Party = {
    id: string;
    code: string;
    createdAt: string;
    creatorId: string;
};

export type PartyMember = {
    id: string;
    userId: string;
    partyId: string;
    createdAt: string;
};

export type Quest = {
    id: string;
    title: string;
    reward: number;
    partyId: string;
    creatorId: string;
    createdAt: string;
    recipientId: string;
    description: string;
    completedAt: string | null;
    mode: Mode;
    status: QuestStatus;
    difficulty: Difficulty;
};

export type Mode = "Race" | "Normal";

export type QuestStatus = "Active" | "Completed";

export type Difficulty = "Tiny" | "Easy" | "Normal" | "Hard" | "Major";
