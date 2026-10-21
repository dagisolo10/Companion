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

export type PartyDetail = Party & {
    _count: { members: number };
    isMember: boolean;
};

export type PartyMember = {
    id: string;
    userId: string;
    partyId: string;
    joinedAt: string;
    user: Pick<User, "id" | "name" | "username">;
};

export type Quest = {
    id: string;
    title: string;
    reward: number;
    partyId: string;
    creatorId: string;
    createdAt: string;
    description: string;
    completedAt: string | null;
    mode: Mode;
    creator: UserInfo;
    status: QuestStatus;
    difficulty: Difficulty;
    party: { code: string };
    _count: { questActivities: number };
    questActivities?: { id: string }[];
};

export type UserInfo = Pick<User, "name" | "username">;

export type QuestCompleter = Pick<User, "id" | "name" | "username">;

export type QuestDetail = Omit<Quest, "questActivities"> & {
    questActivities: { id: string; completedAt: string; user: QuestCompleter }[];
};

export type QuestActivity = {
    id: string;
    completedAt: string;
    user: QuestCompleter;
    quest: Pick<Quest, "id" | "mode" | "title" | "reward" | "description" | "difficulty"> & {
        party: Pick<Party, "code" | "name">;
        creator: UserInfo;
    };
};

export type Mode = "Race" | "Normal";

export type QuestStatus = "Active" | "Completed";

export type Difficulty = "Tiny" | "Easy" | "Normal" | "Hard" | "Major";

export type Filter = "All" | QuestStatus;
