export type User = {
    id: string;
    name: string;
    streak: number;
    username: string;
    createdAt: string;
    experience: number;
    longestStreak: number;
};

export type Party = {
    id: string;
    code: string;
    name: string;
    createdAt: string;
    creatorId: string;
};

export type PartyMember = {
    id: string;
    userId: string;
    partyId: string;
    joinedAt: string;
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

export type QuestActivity = {
    completedAt: string;
    quest: Pick<Quest, "mode" | "title" | "reward" | "description" | "difficulty"> & {
        party: Pick<Party, "name">;
        creator: Pick<User, "name" | "username">;
    };
};

export type Mode = "Race" | "Normal";

export type QuestStatus = "Active" | "Completed";

export type Difficulty = "Tiny" | "Easy" | "Normal" | "Hard" | "Major";
