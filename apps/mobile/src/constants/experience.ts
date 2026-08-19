export type LevelLabel = "Novice" | "Apprentice" | "Initiate" | "Adept" | "Expert" | "Master" | "Grandmaster" | "Champion" | "Legend" | "Mythic";

export type Level = {
    min: number;
    max: number;
    label: LevelLabel;
};

export type Range = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type XPRangesMap = {
    [K in Range]: Level;
};

export const LEVEL_XP_RANGES = {
    1: { label: "Novice", min: 0, max: 99 },
    2: { label: "Apprentice", min: 100, max: 499 },
    3: { label: "Initiate", min: 500, max: 999 },
    4: { label: "Adept", min: 1000, max: 1999 },
    5: { label: "Expert", min: 2000, max: 3499 },
    6: { label: "Master", min: 3500, max: 5499 },
    7: { label: "Grandmaster", min: 5500, max: 7999 },
    8: { label: "Champion", min: 8000, max: 10999 },
    9: { label: "Legend", min: 11000, max: 14999 },
    10: { label: "Mythic", min: 15000, max: Infinity },
} as const satisfies XPRangesMap;
