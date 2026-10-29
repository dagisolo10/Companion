import { Flame, Medal, Zap } from "lucide-react-native";
import { LeaderboardEntry } from "@/types/leaderboard";
import { useColor } from "@/hooks/custom/use-color";
import Text from "@/components/ui/text";
import { View } from "react-native";
import { cn } from "cn";

const AVATAR_COLORS = ["bg-lime", "bg-pink", "bg-amber", "bg-purple"];

const PODIUM: Record<number, { badge: string; medalColor: string; text: string }> = {
    1: { badge: "bg-amber", medalColor: "#000000", text: "text-black" },
    2: { badge: "bg-purple", medalColor: "#000000", text: "text-black" },
    3: { badge: "bg-pink", medalColor: "#000000", text: "text-black" },
};

type LeaderboardRowProps = {
    entry: LeaderboardEntry;
    rank: number;
    isCurrentUser?: boolean;
};

export default function LeaderboardRow({ entry, rank, isCurrentUser = false }: LeaderboardRowProps) {
    const color = useColor();
    const podium = PODIUM[rank];
    const avatarColor = AVATAR_COLORS[(rank - 1) % AVATAR_COLORS.length];

    return (
        <View className={cn("card flex-row items-center gap-3", isCurrentUser && "border-amber")}>
            {podium ? (
                <View className={cn("border-foreground h-11 w-11 items-center justify-center border-2", podium.badge)}>
                    <Medal size={20} color={podium.medalColor} strokeWidth={2.5} />
                </View>
            ) : (
                <View className="border-border bg-muted h-11 w-11 items-center justify-center border-2">
                    <Text className="text-muted-foreground text-base font-extrabold">{rank}</Text>
                </View>
            )}

            <View className={cn("border-foreground h-11 w-11 items-center justify-center border-2", avatarColor)}>
                <Text className="text-sm font-extrabold text-black">{entry.name.charAt(0).toUpperCase()}</Text>
            </View>

            <View className="flex-1">
                <View className="flex-row items-center gap-1.5">
                    <Text className="text-base font-extrabold" numberOfLines={1}>
                        {entry.name}
                    </Text>
                    {isCurrentUser && (
                        <View className="border-foreground bg-amber rounded-md border px-1.5 py-0.5">
                            <Text className="text-[10px] font-extrabold text-black uppercase">You</Text>
                        </View>
                    )}
                </View>
                <View className="flex-row items-center gap-2">
                    <Text className="text-muted-foreground text-xs font-bold">@{entry.username}</Text>
                    <View className="flex-row items-center gap-0.5">
                        <Flame size={11} color="#f97316" strokeWidth={2.5} />
                        <Text className="text-muted-foreground text-[11px] font-bold">{entry.streak}</Text>
                    </View>
                </View>
            </View>

            <View className="items-end gap-0.5">
                <View className="flex-row items-center gap-1">
                    <Zap size={14} color={color.purple} strokeWidth={2.5} />
                    <Text className="text-base font-extrabold">{entry.experience.toLocaleString()}</Text>
                </View>
                <Text className="text-muted-foreground text-[11px] font-bold">
                    Lv {entry.level} · {entry.label}
                </Text>
            </View>
        </View>
    );
}
