export type User = {
    id: string;
    name: string;
    streak: number;
    public: boolean;
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
    mode: Mode;
    title: string;
    reward: number;
    partyId: string;
    creator: UserInfo;
    creatorId: string;
    createdAt: string;
    description: string;
    status: QuestStatus;
    difficulty: Difficulty;
    completedAt: string | null;
    questActivities?: { id: string }[];
    _count: { questActivities: number };
    party: { code: string; name: string };
};

export type UserInfo = Pick<User, "name" | "username">;
export type QuestCompleter = Pick<User, "id" | "name" | "username">;

export type QuestDetail = Omit<Quest, "questActivities"> & {
    questActivities: { id: string; completedAt: string; user: QuestCompleter }[];
};

export type QuestActivity = {
    id: string;
    xpAwarded: number;
    completedAt: string;
    user: QuestCompleter;
    quest: Pick<Quest, "id" | "mode" | "title" | "reward" | "description" | "difficulty"> & {
        creator: UserInfo;
        party: Pick<Party, "code" | "name">;
    };
};

export type Mode = "Rush" | "Normal";
export type Filter = "All" | QuestStatus;
export type QuestStatus = "Active" | "Completed";
export type Difficulty = "Tiny" | "Easy" | "Normal" | "Hard" | "Major";

export type DashboardData = {
    weekXp: number;
    todayXp: number;
    monthXp: number;
    allTimeXp: number;
    weekCompleted: number;
    monthCompleted: number;
    todayCompleted: number;
    allTimeCompleted: number;
};
