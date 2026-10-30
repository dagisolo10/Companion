import { LEVEL_XP_RANGES, LevelLabel } from "@/constants/experience";
import { QuestActivity, User } from "@companion/shared-types";
import { LeaderboardEntry } from "@/types/leaderboard";
import { differenceInCalendarDays } from "date-fns";


type GetLevelReturn = {
    level: number;
    label: LevelLabel;
    nextLevel: number;
    currentLevelMinXp: number;
    nextLevelXp: number | null;
};

export function getLevel(experience: number): GetLevelReturn {
    for (const [level, { min, max, label }] of Object.entries(LEVEL_XP_RANGES)) {
        const currentLevel = Number(level);

        if (experience <= max && experience >= 0) {
            const nextLevel = LEVEL_XP_RANGES[(currentLevel + 1) as keyof typeof LEVEL_XP_RANGES];

            return {
                label,
                level: currentLevel,
                currentLevelMinXp: min,
                nextLevel: currentLevel + 1,
                nextLevelXp: nextLevel?.min ?? null,
            };
        }
    }

    throw new Error("Invalid experience value");
}

export function loadValue(isPending: boolean, value: string | number) {
    return isPending ? "--" : value;
}

export const slugifyUsername = (username: string): string => {
    return username
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^\w-]/g, "");
};

export function toLeaderboardEntry(user: User): LeaderboardEntry {
    const { level, label } = getLevel(user.experience);

    return {
        level,
        label,
        id: user.id,
        name: user.name,
        streak: user.streak,
        username: user.username,
        experience: user.experience,
    };
}

export function groupActivities(activities: QuestActivity[]) {
    const now = new Date();
    const today: typeof activities = [];
    const yesterday: typeof activities = [];
    const thisWeek: typeof activities = [];
    const older: typeof activities = [];

    for (const a of activities) {
        const diffDays = differenceInCalendarDays(now, new Date(a.completedAt));

        if (diffDays < 1) today.push(a);
        else if (diffDays < 2) yesterday.push(a);
        else if (diffDays < 7) thisWeek.push(a);
        else older.push(a);
    }

    return { today, yesterday, thisWeek, older };
}
