import { LeaderboardEntry } from "@/types/leaderboard";
import { Pressable, View } from "react-native";
import { Crown } from "lucide-react-native";
import Text from "@/components/ui/text";
import { router } from "expo-router";
import { cn } from "cn";

const AVATAR_COLORS = ["bg-lime", "bg-amber", "bg-pink", "bg-purple"];
const PODIUM_HEIGHTS: Record<number, string> = { 1: "h-32", 2: "h-24", 3: "h-16" };
const PODIUM_COLORS: Record<number, string> = { 1: "bg-lime", 2: "bg-amber", 3: "bg-pink" };

function PodiumSlot({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
    const avatarColor = AVATAR_COLORS[(rank - 1) % AVATAR_COLORS.length];
    const isFirst = rank === 1;

    return (
        <View className={cn("flex-1 items-center gap-2", !isFirst && "pt-6")}>
            {isFirst && <Crown size={22} color="#ffba00" fill="#ffba00" strokeWidth={2} />}

            <Pressable className={cn("border-foreground h-14 w-14 items-center justify-center border-2", avatarColor)} onPress={() => router.push({ pathname: "/(app)/user/[username]", params: { username: entry.username } })}>
                <Text className="text-lg font-extrabold text-black">{entry.name.charAt(0).toUpperCase()}</Text>
            </Pressable>

            <View className="items-center px-1">
                <Text className="text-center text-sm font-extrabold" numberOfLines={1}>
                    {entry.name}
                </Text>
                <Text className="text-muted-foreground text-[11px] font-bold">{entry.experience.toLocaleString()} XP</Text>
            </View>

            <View className={cn("border-foreground w-full items-center justify-center rounded-t-2xl border-2 border-b-0 pt-2", PODIUM_HEIGHTS[rank], PODIUM_COLORS[rank])}>
                <Text className="text-2xl font-extrabold text-black">{rank}</Text>
            </View>
        </View>
    );
}

export default function LeaderboardPodium({ entries }: { entries: LeaderboardEntry[] }) {
    const [first, second, third] = entries;

    if (!first || !second || !third) return null;

    return (
        <View className="card pb-0">
            <View className="flex-row items-end gap-2">
                <PodiumSlot entry={second} rank={2} />
                <PodiumSlot entry={first} rank={1} />
                <PodiumSlot entry={third} rank={3} />
            </View>
        </View>
    );
}
