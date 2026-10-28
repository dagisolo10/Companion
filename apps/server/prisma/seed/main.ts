import { PrismaPg } from "@prisma/adapter-pg";
import { Difficulty, PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] });
const prisma = new PrismaClient({ adapter });

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

const REWARD: Record<Difficulty, number> = {
    Tiny: 5,
    Easy: 10,
    Normal: 25,
    Hard: 50,
    Major: 100,
};

const u = (id: string, name: string, username: string, experience: number, streak: number, longest: number, createdAt?: Date) => ({
    id,
    name,
    username,
    experience,
    streak,
    longestStreak: longest,
    ...(createdAt && { createdAt }),
});

type UserData = ReturnType<typeof u>;

const coreUsers = [
    u("3307d138-931b-4c32-a291-cc2761d40509", "Dagisolo", "ayakashi", 18500, 47, 92, new Date("2026-10-21T00:46:37.903Z")),
    u("3481f414-75c3-48ef-8654-392c44fb0ed4", "Sniper Rollins", "sniper_rollins", 9500, 30, 61, new Date("2026-10-28 04:57:29.528")),
    u("a1b2c3d4-0001-4000-8000-000000000001", "Alex Rivera", "alex", 0, 5, 12),
    u("a1b2c3d4-0002-4000-8000-000000000002", "Jordan Chen", "jordan", 0, 2, 4),
    u("a1b2c3d4-0003-4000-8000-000000000003", "Sam Patel", "sam", 0, 0, 3),
    u("a1b2c3d4-0004-4000-8000-000000000004", "Morgan Blake", "morgan", 0, 9, 21),
    u("a1b2c3d4-0005-4000-8000-000000000005", "Casey Kim", "casey", 0, 1, 7),
    u("a1b2c3d4-0006-4000-8000-000000000006", "Riley Thompson", "riley", 0, 6, 17),
    u("a1b2c3d4-0007-4000-8000-000000000007", "Avery Nguyen", "avery", 0, 4, 9),
    u("a1b2c3d4-0008-4000-8000-000000000008", "Dakota Lee", "dakota", 0, 12, 25),
    u("a1b2c3d4-0009-4000-8000-000000000009", "Harper Wilson", "harper", 0, 7, 14),
];

const [ayakashi, sniper_rollins, alex, jordan, sam, morgan, casey, riley, avery, dakota, harper] = coreUsers;

// ── Generated global community (the "roster" that shows up in search/leaderboards) ──

const FIRST_NAMES = [
    "Liam",
    "Noah",
    "Oliver",
    "Elijah",
    "James",
    "William",
    "Benjamin",
    "Lucas",
    "Henry",
    "Alexander",
    "Mia",
    "Emma",
    "Olivia",
    "Ava",
    "Sophia",
    "Isabella",
    "Charlotte",
    "Amelia",
    "Harper",
    "Evelyn",
    "Yuki",
    "Haruto",
    "Sota",
    "Ren",
    "Aoi",
    "Hina",
    "Sakura",
    "Mei",
    "Kenji",
    "Riku",
    "Mateo",
    "Santiago",
    "Sebastian",
    "Diego",
    "Alejandro",
    "Valentina",
    "Camila",
    "Sofia",
    "Isabella",
    "Lucia",
    "Lucas",
    "Hugo",
    "Louis",
    "Gabriel",
    "Raphael",
    "Lea",
    "Emma",
    "Chloe",
    "Manon",
    "Juliette",
    "Wei",
    "Chen",
    "Jun",
    "Hao",
    "Ming",
    "Li",
    "Xiu",
    "Yan",
    "Mei",
    "Ling",
    "Arjun",
    "Rohan",
    "Vihaan",
    "Aditya",
    "Ishaan",
    "Aanya",
    "Diya",
    "Ananya",
    "Priya",
    "Saanvi",
    "Ahmed",
    "Omar",
    "Yusuf",
    "Ali",
    "Hassan",
    "Fatima",
    "Layla",
    "Aisha",
    "Zara",
    "Noor",
    "Kwame",
    "Kofi",
    "Chidi",
    "Amara",
    "Zuri",
    "Ayana",
    "Ife",
    "Nia",
    "Tunde",
    "Sade",
    "Ivan",
    "Dmitri",
    "Nikolai",
    "Sofia",
    "Anastasia",
    "Katya",
    "Maksim",
    "Elena",
    "Pavel",
    "Vera",
    "Carlos",
    "Miguel",
    "Javier",
    "Rafael",
    "Elena",
    "Mariana",
    "Isabel",
    "Pablo",
    "Sergio",
    "Julia",
    "Ethan",
    "Mason",
    "Logan",
    "Jacob",
    "Aiden",
    "Grace",
    "Lily",
    "Zoe",
    "Nora",
    "Ruby",
    "Freya",
    "Lars",
    "Bjorn",
    "Ingrid",
    "Astrid",
    "Sven",
    "Erik",
    "Sigrid",
    "Magnus",
    "Elsa",
    "Amir",
    "Reza",
    "Sara",
    "Leila",
    "Darius",
    "Cyrus",
    "Nasrin",
    "Farah",
    "Kian",
    "Roshni",
    "Tomas",
    "Matej",
    "Lukas",
    "Petra",
    "Jan",
    "Eva",
    "Martin",
    "Anna",
    "Filip",
    "Katerina",
    "Ade",
    "Budi",
    "Siti",
    "Dewi",
    "Rizky",
    "Putri",
    "Agus",
    "Rina",
    "Bayu",
    "Citra",
] as const;

const LAST_NAMES = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Anderson",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin",
    "Tanaka",
    "Suzuki",
    "Sato",
    "Takahashi",
    "Watanabe",
    "Ito",
    "Yamamoto",
    "Nakamura",
    "Kobayashi",
    "Kato",
    "Kim",
    "Lee",
    "Park",
    "Choi",
    "Jung",
    "Kang",
    "Cho",
    "Yoon",
    "Jang",
    "Lim",
    "Nguyen",
    "Tran",
    "Le",
    "Pham",
    "Hoang",
    "Vu",
    "Dang",
    "Bui",
    "Do",
    "Ho",
    "Patel",
    "Singh",
    "Kumar",
    "Sharma",
    "Gupta",
    "Reddy",
    "Nair",
    "Iyer",
    "Mehta",
    "Joshi",
    "Al-Farsi",
    "Hassan",
    "Khan",
    "Ali",
    "Rahman",
    "Aziz",
    "Malik",
    "Sheikh",
    "Qureshi",
    "Syed",
    "Okafor",
    "Adeyemi",
    "Mensah",
    "Osei",
    "Abara",
    "Diallo",
    "Traore",
    "Kamara",
    "Nkosi",
    "Mwangi",
    "Petrov",
    "Ivanov",
    "Smirnov",
    "Kuznetsov",
    "Popov",
    "Sokolov",
    "Volkov",
    "Novak",
    "Horvath",
    "Kovacs",
    "Silva",
    "Santos",
    "Ferreira",
    "Costa",
    "Oliveira",
    "Pereira",
    "Almeida",
    "Ribeiro",
    "Carvalho",
    "Gomes",
    "Muller",
    "Schmidt",
    "Schneider",
    "Fischer",
    "Weber",
    "Meyer",
    "Wagner",
    "Becker",
    "Hoffmann",
    "Schulz",
    "Rossi",
    "Russo",
    "Ferrari",
    "Esposito",
    "Bianchi",
    "Romano",
    "Colombo",
    "Ricci",
    "Marino",
    "Greco",
    "Dubois",
    "Moreau",
    "Laurent",
    "Simon",
    "Michel",
    "Lefebvre",
    "Leroy",
    "Roux",
    "Fournier",
    "Girard",
    "Andersen",
    "Nielsen",
    "Hansen",
    "Pedersen",
    "Christensen",
    "Larsen",
    "Sorensen",
    "Rasmussen",
    "Jorgensen",
    "Olsen",
    "Novak",
    "Svoboda",
    "Dvorak",
    "Cerny",
    "Prochazka",
    "Kucera",
    "Vesely",
    "Horak",
    "Nemec",
    "Marek",
] as const;

// Deterministic PRNG so seeds are reproducible.
function mulberry32(seed: number) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const pick = <T>(rand: () => number, arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];

const GENERATED_USER_COUNT = 290;
const generatedUsers: UserData[] = [];
const usedUsernames = new Set(coreUsers.map((user) => user.username));
const rand = mulberry32(20261021);

for (let i = 0; i < GENERATED_USER_COUNT; i++) {
    const first = pick(rand, FIRST_NAMES);
    const last = pick(rand, LAST_NAMES);
    const name = `${first} ${last}`;

    let username = `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, "");
    let suffix = 1;
    while (usedUsernames.has(username)) {
        username = `${first}.${last}${suffix}`.toLowerCase().replace(/[^a-z0-9.]/g, "");
        suffix++;
    }
    usedUsernames.add(username);

    // Tiered progression: most players low/mid, few elite, Dagisolo untouchable at the top.
    const roll = rand();
    let experience: number;
    let streak: number;
    if (roll < 0.5) {
        experience = Math.floor(100 + rand() * 900);
        streak = Math.floor(rand() * 8);
    } else if (roll < 0.82) {
        experience = Math.floor(1000 + rand() * 2500);
        streak = Math.floor(rand() * 18);
    } else if (roll < 0.96) {
        experience = Math.floor(3500 + rand() * 4500);
        streak = Math.floor(rand() * 35);
    } else {
        experience = Math.floor(8000 + rand() * 6500);
        streak = Math.floor(rand() * 60);
    }
    const longestStreak = streak + Math.floor(rand() * 20);

    const createdAt = daysAgo(Math.floor(1 + rand() * 400));
    const id = `f0e1d2c3-${String(i + 1).padStart(4, "0")}-4000-8000-${String(i + 1).padStart(12, "0")}`;

    generatedUsers.push(u(id, name, username, experience, streak, longestStreak, createdAt));
}

const generatedById = new Map(generatedUsers.map((user) => [user.id, user]));

const users: UserData[] = [...coreUsers, ...generatedUsers];

type PartyData = {
    id: string;
    name: string;
    code: string;
    creatorId: string;
};

const coreParties: PartyData[] = [
    // Ayakashi created these 3
    {
        id: "b1b2c3d4-0001-4000-8000-000000000001",
        name: "Night Owls",
        code: "OWL0001",
        creatorId: ayakashi.id,
    },
    {
        id: "b1b2c3d4-0002-4000-8000-000000000002",
        name: "Code Warriors",
        code: "CODE001",
        creatorId: ayakashi.id,
    },
    {
        id: "b1b2c3d4-0003-4000-8000-000000000003",
        name: "Daily Grind",
        code: "GRIND01",
        creatorId: sniper_rollins.id,
    },
    // Someone else created this one (for leaving)
    {
        id: "b1b2c3d4-0004-4000-8000-000000000004",
        name: "Riley's Raiders",
        code: "RAID001",
        creatorId: riley.id,
    },
];

const [nightOwls, codeWarriors, dailyGrind, raiders] = coreParties;

type PartyId = string;

const memberships: { partyId: PartyId; user: UserData }[] = [
    // Night Owls (Ayakashi's party)
    { partyId: nightOwls.id, user: ayakashi },
    { partyId: nightOwls.id, user: sniper_rollins },
    { partyId: nightOwls.id, user: alex },
    { partyId: nightOwls.id, user: jordan },
    { partyId: nightOwls.id, user: casey },
    { partyId: nightOwls.id, user: avery },

    // Code Warriors (Ayakashi's party)
    { partyId: codeWarriors.id, user: ayakashi },
    { partyId: codeWarriors.id, user: sniper_rollins },
    { partyId: codeWarriors.id, user: morgan },
    { partyId: codeWarriors.id, user: riley },
    { partyId: codeWarriors.id, user: dakota },

    // Daily Grind (Ayakashi's party)
    { partyId: dailyGrind.id, user: ayakashi },
    { partyId: dailyGrind.id, user: sniper_rollins },
    { partyId: dailyGrind.id, user: harper },
    { partyId: dailyGrind.id, user: sam },
    { partyId: dailyGrind.id, user: alex },
    { partyId: dailyGrind.id, user: morgan },

    // Riley's Raiders (someone else's party — Ayakashi can leave this one)
    { partyId: raiders.id, user: riley },
    { partyId: raiders.id, user: ayakashi },
    { partyId: raiders.id, user: sniper_rollins },
    { partyId: raiders.id, user: harper },
    { partyId: raiders.id, user: dakota },
    { partyId: raiders.id, user: casey },
];

// ── Generated global parties ──

const PARTY_THEMES = [
    "Dawn Patrol",
    "Iron Wolves",
    "Starlight Guild",
    "Thunder Squad",
    "Crimson Order",
    "Azure Alliance",
    "Shadow Pack",
    "Golden Circle",
    "Frost Legion",
    "Ember Collective",
    "Silver Serpents",
    "Nomad Tribe",
    "Vanguard",
    "Spectre Unit",
    "Titan Crew",
    "Phoenix Syndicate",
    "Obsidian Guild",
    "Radiant Few",
    "Wild Hunt",
    "Storm Chasers",
    "Night Watch",
    "Sky Runners",
    "Deep Divers",
    "Trail Blazers",
    "Summit Seekers",
    "Wavelength",
    "Momentum",
    "Catalyst",
    "Apex Circle",
    "Zenith Crew",
    "Rogue Scholars",
    "Lunar Society",
    "Solar Assembly",
    "Quantum Guild",
    "Nova Pack",
    "Eclipse Order",
    "Wanderlust",
    "Highland Crew",
    "Coastal Alliance",
    "Desert Nomads",
    "Northern Lights",
    "Southern Cross",
    "Ashen Vanguard",
    "Jade Legion",
    "Coral Collective",
    "Onyx Syndicate",
    "Verdant Order",
    "Sable Circle",
    "Mirage Guild",
    "Comet Pack",
    "Horizon Seekers",
    "Ironwood Crew",
    "Neon Assembly",
    "Sundown Patrol",
    "Tidal Force",
    "Granite Company",
    "Aurora League",
    "Cinder Pact",
    "Mystic Circle",
    "Pioneer Squad",
    "Velocity Guild",
    "Umbra Collective",
    "Solstice Pack",
    "Marrow Union",
    "Sage Alliance",
    "Vortex Crew",
    "Beacon Society",
    "Cascade Tribe",
    "Fable Guild",
    "Oasis Circle",
    "Rift Walkers",
    "Tundra Pack",
] as const;

const PARTY_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const partyCode = () => Array.from({ length: 6 }, () => pick(rand, PARTY_CODE_CHARS.split(""))).join("");
const usedPartyCodes = new Set<string>();
const uniquePartyCode = () => {
    let code = partyCode();
    while (usedPartyCodes.has(code)) code = partyCode();
    usedPartyCodes.add(code);
    return code;
};

const generatedParties: PartyData[] = [];
for (let i = 0; i < PARTY_THEMES.length; i++) {
    const creator = generatedUsers[Math.floor(rand() * generatedUsers.length)]!;
    generatedParties.push({
        id: `e5d4c3b2-${String(i + 1).padStart(4, "0")}-4000-8000-${String(i + 1).padStart(12, "0")}`,
        name: PARTY_THEMES[i]!,
        code: uniquePartyCode(),
        creatorId: creator.id,
    });
}

const parties: PartyData[] = [...coreParties, ...generatedParties];

// Give every party a realistic roster (5–15 members, creator always in it), then make sure
// every generated user is a member of at least one party and at most four.
const partyRosters = new Map<PartyId, Set<string>>();
for (const party of generatedParties) {
    const target = 5 + Math.floor(rand() * 11);
    const roster = new Set<string>([party.creatorId]);
    let guard = 0;
    while (roster.size < target && guard < 500) {
        roster.add(generatedUsers[Math.floor(rand() * generatedUsers.length)]!.id);
        guard++;
    }
    partyRosters.set(party.id, roster);
}

// Any generated user left without a party gets assigned to 1–3 random parties.
const partyIdsForAssignment = generatedParties.map((party) => party.id);
for (const user of generatedUsers) {
    const member = [...partyRosters.values()].some((roster) => roster.has(user.id));
    if (member) continue;

    const joinCount = 1 + Math.floor(rand() * 3);
    const joined = new Set<string>();
    let guard = 0;
    while (joined.size < joinCount && guard < 50) {
        const partyId = partyIdsForAssignment[Math.floor(rand() * partyIdsForAssignment.length)]!;
        if (!joined.has(partyId)) {
            joined.add(partyId);
            partyRosters.get(partyId)!.add(user.id);
        }
        guard++;
    }
}

for (const [partyId, roster] of partyRosters) {
    for (const userId of roster) {
        memberships.push({ partyId, user: generatedById.get(userId)! });
    }
}

const q = (id: string, partyId: PartyId, creator: UserData, _completer: UserData, title: string, description: string, mode: "Rush" | "Normal", difficulty: Difficulty, status: "Active" | "Completed", createdAtDaysAgo: number, completedDaysAgo?: number) => ({
    id,
    partyId,
    creatorId: creator.id,
    title,
    description,
    mode,
    difficulty,
    reward: REWARD[difficulty],
    status,
    createdAt: daysAgo(createdAtDaysAgo),
    completedAt: completedDaysAgo !== undefined ? daysAgo(completedDaysAgo) : null,
});

const quests: ReturnType<typeof q>[] = [
    // ── Night Owls (Ayakashi created) ──
    // Ayakashi assigned quests to others
    q("c1b2c3d4-0001-4000-8000-000000000001", nightOwls.id, ayakashi, alex, "Morning Run", "Run 3km before sunrise and log your time", "Rush", "Normal", "Completed", 14, 7),
    q("c1b2c3d4-0002-4000-8000-000000000002", nightOwls.id, sniper_rollins, alex, "Morning Run", "Run 3km before sunrise and log your time", "Rush", "Normal", "Completed", 14, 7),
    q("c1b2c3d4-0003-4000-8000-000000000003", nightOwls.id, ayakashi, jordan, "Read 20 Pages", "Read 20 pages of any book before bed", "Normal", "Easy", "Completed", 10, 3),
    q("c1b2c3d4-0004-4000-8000-000000000004", nightOwls.id, sniper_rollins, jordan, "Read 20 Pages", "Read 20 pages of any book before bed", "Normal", "Easy", "Completed", 10, 3),
    q("c1b2c3d4-0005-4000-8000-000000000005", nightOwls.id, ayakashi, casey, "Clean Your Room", "Tidy up desk, make bed, and organize closet", "Normal", "Tiny", "Completed", 8, 1),
    q("c1b2c3d4-0006-4000-8000-000000000006", nightOwls.id, sniper_rollins, casey, "Clean Your Room", "Tidy up desk, make bed, and organize closet", "Normal", "Tiny", "Completed", 8, 1),
    q("c1b2c3d4-0007-4000-8000-000000000007", nightOwls.id, ayakashi, avery, "Ship a Feature", "Complete the profile page redesign and open a PR", "Rush", "Hard", "Active", 4),
    q("c1b2c3d4-0008-4000-8000-000000000008", nightOwls.id, sniper_rollins, avery, "Ship a Feature", "Complete the profile page redesign and open a PR", "Rush", "Hard", "Active", 4),
    q("c1b2c3d4-0009-4000-8000-000000000009", nightOwls.id, ayakashi, alex, "Cook Dinner", "Prepare a home-cooked meal for the group", "Normal", "Normal", "Active", 2),
    q("c1b2c3d4-0010-4000-8000-000000000010", nightOwls.id, sniper_rollins, alex, "Cook Dinner", "Prepare a home-cooked meal for the group", "Normal", "Normal", "Active", 2),

    // Others assigned quests TO Ayakashi
    q("c1b2c3d4-0011-4000-8000-000000000011", nightOwls.id, alex, ayakashi, "Fix the Bug", "Track down and fix the login timeout issue in the auth module", "Rush", "Hard", "Completed", 12, 5),
    q("c1b2c3d4-0012-4000-8000-000000000012", nightOwls.id, jordan, ayakashi, "Write Documentation", "Document the new API endpoints with examples", "Normal", "Normal", "Completed", 9, 2),
    q("c1b2c3d4-0013-4000-8000-000000000013", nightOwls.id, casey, ayakashi, "Review PRs", "Review and approve at least 3 open pull requests", "Normal", "Easy", "Active", 3),
    q("c1b2c3d4-0014-4000-8000-000000000014", nightOwls.id, avery, ayakashi, "Deploy Release", "Push v2.1.0 to production with zero downtime", "Rush", "Major", "Active", 1),

    // ── Code Warriors (Ayakashi created) ──
    q("c1b2c3d4-0015-4000-8000-000000000015", codeWarriors.id, ayakashi, morgan, "Refactor Auth Module", "Migrate from JWT to session-based auth", "Normal", "Hard", "Completed", 16, 8),
    q("c1b2c3d4-0016-4000-8000-000000000016", codeWarriors.id, sniper_rollins, morgan, "Refactor Auth Module", "Migrate from JWT to session-based auth", "Normal", "Hard", "Completed", 16, 8),
    q("c1b2c3d4-0017-4000-8000-000000000017", codeWarriors.id, ayakashi, riley, "Write Unit Tests", "Achieve 80% test coverage on the payment module", "Rush", "Major", "Completed", 13, 4),
    q("c1b2c3d4-0018-4000-8000-000000000018", codeWarriors.id, sniper_rollins, riley, "Write Unit Tests", "Achieve 80% test coverage on the payment module", "Rush", "Major", "Completed", 13, 4),
    q("c1b2c3d4-0019-4000-8000-000000000019", codeWarriors.id, ayakashi, dakota, "Update CI Pipeline", "Switch from Travis CI to GitHub Actions", "Normal", "Normal", "Active", 5),
    q("c1b2c3d4-0020-4000-8000-000000000020", codeWarriors.id, sniper_rollins, dakota, "Update CI Pipeline", "Switch from Travis CI to GitHub Actions", "Normal", "Normal", "Active", 5),
    q("c1b2c3d4-0021-4000-8000-000000000021", codeWarriors.id, ayakashi, morgan, "Code Review", "Review the database migration PR and leave feedback", "Normal", "Tiny", "Active", 2),
    q("c1b2c3d4-0022-4000-8000-000000000022", codeWarriors.id, sniper_rollins, morgan, "Code Review", "Review the database migration PR and leave feedback", "Normal", "Tiny", "Active", 2),

    // Others assigned quests TO Ayakashi
    q("c1b2c3d4-0023-4000-8000-000000000023", codeWarriors.id, morgan, ayakashi, "Build Dashboard", "Create the admin dashboard with real-time analytics", "Rush", "Hard", "Completed", 15, 6),
    q("c1b2c3d4-0024-4000-8000-000000000024", codeWarriors.id, riley, ayakashi, "Optimize Queries", "Reduce average API response time by 40%", "Normal", "Major", "Completed", 11, 3),
    q("c1b2c3d4-0025-4000-8000-000000000025", codeWarriors.id, dakota, ayakashi, "Set Up Monitoring", "Configure Datadog alerts for critical endpoints", "Normal", "Easy", "Active", 4),

    // ── Daily Grind (Ayakashi created) ──
    q("c1b2c3d4-0026-4000-8000-000000000026", dailyGrind.id, ayakashi, harper, "Walk 10k Steps", "Hit 10,000 steps on the fitness tracker every day for a week", "Normal", "Normal", "Completed", 20, 10),
    q("c1b2c3d4-0027-4000-8000-000000000027", dailyGrind.id, sniper_rollins, harper, "Walk 10k Steps", "Hit 10,000 steps on the fitness tracker every day for a week", "Normal", "Normal", "Completed", 20, 10),
    q("c1b2c3d4-0028-4000-8000-000000000028", dailyGrind.id, ayakashi, sam, "Journal Daily", "Write a 200-word journal entry every morning", "Normal", "Easy", "Active", 6),
    q("c1b2c3d4-0029-4000-8000-000000000029", dailyGrind.id, ayakashi, alex, "Meditate 10 Min", "Complete a guided meditation session using Headspace", "Normal", "Tiny", "Active", 3),
    q("c1b2c3d4-0030-4000-8000-000000000030", dailyGrind.id, sniper_rollins, alex, "Meditate 10 Min", "Complete a guided meditation session using Headspace", "Normal", "Tiny", "Active", 3),
    q("c1b2c3d4-0031-4000-8000-000000000031", dailyGrind.id, ayakashi, morgan, "No Social Media", "Stay off social media for an entire weekend", "Rush", "Hard", "Active", 1),
    q("c1b2c3d4-0032-4000-8000-000000000032", dailyGrind.id, sniper_rollins, morgan, "No Social Media", "Stay off social media for an entire weekend", "Rush", "Hard", "Active", 1),

    // Others assigned quests TO Ayakashi
    q("c1b2c3d4-0033-4000-8000-000000000033", dailyGrind.id, harper, ayakashi, "Read a Book", "Finish reading any non-fiction book this month", "Normal", "Normal", "Active", 7),
    q("c1b2c3d4-0034-4000-8000-000000000034", dailyGrind.id, sam, ayakashi, "Learn Guitar", "Practice chord transitions for 30 minutes daily for a week", "Rush", "Easy", "Active", 5),
    q("c1b2c3d4-0035-4000-8000-000000000035", dailyGrind.id, alex, ayakashi, "Cold Shower", "Take a cold shower every morning for 5 days straight", "Rush", "Major", "Active", 2),
    q("c1b2c3d4-0036-4000-8000-000000000036", dailyGrind.id, morgan, ayakashi, "Drink 3L Water", "Track daily water intake and hit 3 liters for a week", "Normal", "Tiny", "Completed", 18, 11),

    // ── Riley's Raiders (someone else's party — Ayakashi is just a member) ──
    q("c1b2c3d4-0037-4000-8000-000000000037", raiders.id, riley, harper, "Sprint Planning", "Organize next sprint's backlog and estimate story points", "Normal", "Normal", "Completed", 10, 4),
    q("c1b2c3d4-0038-4000-8000-000000000038", raiders.id, harper, dakota, "Fix Memory Leak", "Track down and resolve the WebSocket memory leak", "Rush", "Hard", "Active", 5),
    q("c1b2c3d4-0039-4000-8000-000000000039", raiders.id, riley, ayakashi, "Write Tests", "Add integration tests for the checkout flow", "Normal", "Normal", "Active", 3),
    q("c1b2c3d4-0040-4000-8000-000000000040", raiders.id, dakota, casey, "Update README", "Rewrite the project README with setup instructions", "Normal", "Tiny", "Completed", 7, 2),
    q("c1b2c3d4-0041-4000-8000-000000000041", raiders.id, casey, riley, "Debug CI", "Fix the flaky e2e test that keeps failing on main", "Rush", "Easy", "Active", 1),
    q("c1b2c3d4-0042-4000-8000-000000000042", raiders.id, sniper_rollins, sam, "Journal Daily", "Write a 200-word journal entry every morning", "Normal", "Easy", "Active", 6),
];

// ── Generated quests for the global parties ──

const QUEST_TITLES = [
    ["Morning Run", "Run 5km before the day starts"],
    ["Deep Work Session", "Focus for 90 minutes with no distractions"],
    ["Read 30 Pages", "Finish a chapter of your current book"],
    ["Meditate", "Complete a 15-minute guided session"],
    ["Workout", "Finish a full strength training session"],
    ["Hydrate", "Drink 3 liters of water today"],
    ["Ship a Feature", "Merge a meaningful pull request"],
    ["Inbox Zero", "Clear your entire inbox"],
    ["Walk 10k Steps", "Hit 10,000 steps on your tracker"],
    ["Journal", "Write a reflection for today"],
    ["Learn a Language", "Complete a 20-minute lesson"],
    ["No Phone Morning", "First hour of the day phone-free"],
    ["Cook a Meal", "Prepare a home-cooked meal"],
    ["Practice Instrument", "30 minutes of focused practice"],
    ["Review PRs", "Review at least 3 open pull requests"],
    ["Clean Workspace", "Tidy up desk and organize files"],
    ["Plan Tomorrow", "Write a plan for tomorrow before bed"],
    ["Stretch", "Complete a full mobility routine"],
    ["Cold Shower", "Brave a cold shower to start the day"],
    ["Call a Friend", "Reconnect with someone you care about"],
] as const;

const DESCRIPTIONS = ["Log your progress and keep the streak alive.", "Small consistent effort compounds over time.", "Finish this before your evening wind-down.", "Track it honestly — the party is watching.", "A quick win to build momentum for the day."] as const;

let generatedQuestCounter = 0;
for (const party of generatedParties) {
    const roster = memberships.filter((m) => m.partyId === party.id).map((m) => m.user);
    const questCount = 8 + Math.floor(rand() * 8);

    for (let i = 0; i < questCount; i++) {
        const creator = roster[Math.floor(rand() * roster.length)]!;
        let completer = roster[Math.floor(rand() * roster.length)]!;
        if (completer.id === creator.id) completer = roster[(roster.indexOf(creator) + 1) % roster.length]!;

        const [title, description] = QUEST_TITLES[Math.floor(rand() * QUEST_TITLES.length)]!;
        const difficulty = pick(rand, ["Tiny", "Easy", "Normal", "Hard", "Major"] as const);
        const mode: "Rush" | "Normal" = rand() < 0.3 ? "Rush" : "Normal";
        const status: "Active" | "Completed" = rand() < 0.55 ? "Completed" : "Active";
        const createdAtDaysAgo = Math.floor(1 + rand() * 60);
        const completedDaysAgo = status === "Completed" ? Math.floor(rand() * createdAtDaysAgo) : undefined;
        const desc = rand() < 0.5 ? description : pick(rand, DESCRIPTIONS);

        generatedQuestCounter++;
        quests.push(q(`09f8e7d6-${String(generatedQuestCounter).padStart(4, "0")}-4000-8000-${String(generatedQuestCounter).padStart(12, "0")}`, party.id, creator, completer, title, desc, mode, difficulty, status, createdAtDaysAgo, completedDaysAgo));
    }
}

const completedQuests = quests.filter((quest) => quest.status === "Completed");

const partyMembersByParty: Record<PartyId, UserData[]> = memberships.reduce(
    (acc, m) => {
        (acc[m.partyId] ??= []).push(m.user);
        return acc;
    },
    {} as Record<PartyId, UserData[]>,
);

async function main() {
    console.log("Seeding database...");

    await prisma.$transaction([prisma.questActivity.deleteMany(), prisma.quest.deleteMany(), prisma.partyMember.deleteMany(), prisma.party.deleteMany(), prisma.user.deleteMany()]);

    console.log("Cleared existing data.");

    await prisma.user.createMany({ data: [...users] });
    console.log(`Created ${users.length} users.`);

    await prisma.party.createMany({ data: [...parties] });
    console.log(`Created ${parties.length} parties.`);

    const memberData = memberships.map((m, i) => ({
        id: `d1b2c3d4-${String(i + 1).padStart(4, "0")}-4000-8000-000000000001`,
        partyId: m.partyId,
        userId: m.user.id,
    }));
    await prisma.partyMember.createMany({ data: memberData });
    console.log(`Created ${memberData.length} party memberships.`);

    await prisma.quest.createMany({ data: [...quests] });
    console.log(`Created ${quests.length} quests.`);

    const NORMAL_XP_RATES = [1, 0.75, 0.5, 0.25];

    const activityData = completedQuests.flatMap((quest) => {
        const members = partyMembersByParty[quest.partyId as PartyId];
        return members.map((member, index) => {
            const xpAwarded = quest.mode === "Rush" ? (index === 0 ? quest.reward : 0) : Math.round(quest.reward * NORMAL_XP_RATES[Math.min(index + 1, NORMAL_XP_RATES.length) - 1]);
            return {
                questId: quest.id,
                userId: member.id,
                xpAwarded,
                completedAt: quest.completedAt!,
            };
        });
    });
    await prisma.questActivity.createMany({ data: activityData });
    console.log(`Created ${activityData.length} quest activities.`);

    const earnedXp = activityData.reduce(
        (acc, activity) => {
            acc[activity.userId] = (acc[activity.userId] ?? 0) + activity.xpAwarded;
            return acc;
        },
        {} as Record<string, number>,
    );

    const BASE_XP = 100;
    const STREAK_XP = 25;

    for (const user of users) {
        const experience = user.experience > 0 ? user.experience : BASE_XP + earnedXp[user.id]! + user.streak * STREAK_XP;
        await prisma.user.update({ where: { id: user.id }, data: { experience } });
    }

    console.log(`Awarded XP to ${users.length} users.`);

    console.log("Seed complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
