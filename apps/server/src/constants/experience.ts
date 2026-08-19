export const LEVEL_XP_RANGES = {
    1: { min: 0, max: 99 },
    2: { min: 100, max: 499 },
    3: { min: 500, max: 999 },
    4: { min: 1000, max: 1999 },
    5: { min: 2000, max: 3499 },
    6: { min: 3500, max: 5499 },
    7: { min: 5500, max: 7999 },
    8: { min: 8000, max: 10999 },
    9: { min: 11000, max: 14999 },
    10: { min: 15000, max: Infinity },
} as const;
