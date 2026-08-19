import { LEVEL_XP_RANGES, LevelLabel } from "@/constants/experience";

export type GetLevelReturn = {
    level: number;
    label: LevelLabel;
    nextLevel: number;
    nextLevelXp: number;
};

export function getLevel(experience: number): GetLevelReturn {
    for (const [level, { max, label }] of Object.entries(LEVEL_XP_RANGES)) {
        const currentLevel = Number(level);

        if (experience <= max && experience >= 0) {
            const nextLevel = LEVEL_XP_RANGES[(currentLevel + 1) as keyof typeof LEVEL_XP_RANGES];

            return {
                label,
                level: currentLevel,
                nextLevel: currentLevel + 1,
                nextLevelXp: nextLevel.min ?? null,
            };
        }
    }

    throw new Error("Invalid experience value");
}
