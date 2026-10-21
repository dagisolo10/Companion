import { LevelLabel } from "@/constants/experience";
import { User } from "@/types/models";

export type LeaderboardEntry = {
    id: string;
    name: string;
    username: string;
    experience: number;
    level: number;
    label: LevelLabel;
    streak: number;
};

export type LeaderboardScope = "global" | "party";

export type PartyLeaderboardMember = {
    user: User;
    id: string;
    userId: string;
    partyId: string;
    joinedAt: string;
};
