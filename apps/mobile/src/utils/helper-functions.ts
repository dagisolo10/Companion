import { LEVEL_XP_RANGES, LevelLabel } from "@/constants/experience";

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
