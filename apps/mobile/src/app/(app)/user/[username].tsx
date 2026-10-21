import BackButton from "@/components/back-button";
import LevelCard from "@/components/level-card";
import StreakCard from "@/components/streak-card";
import Screen from "@/components/ui/screen";
import { SkeletonCard, SkeletonLevelCard, SkeletonStreakCard } from "@/components/ui/skeleton";
import Text from "@/components/ui/text";
import { useFindUser } from "@/hooks/tan-stack/user";
import { useLocalSearchParams } from "expo-router";
import { CheckCircle2, Flame, Sparkles, Trophy } from "lucide-react-native";
import { View } from "react-native";

export default function PlayerProfileScreen() {
    const { username } = useLocalSearchParams<{ username: string }>();
    const { data: user, error, isFetching } = useFindUser(username!, { enabled: !!username });

    if (isFetching) {
        return (
            <Screen className="gap-5">
                <BackButton />
                <SkeletonLevelCard />
                <SkeletonStreakCard />
                <SkeletonCard lines={2} />
            </Screen>
        );
    }

    if (error || !user) {
        return (
            <Screen className="gap-5">
                <BackButton />
                <Text className="text-destructive font-jakarta-bold text-sm">{error?.message || "User not found"}</Text>
            </Screen>
        );
    }

    const initial = user.name.charAt(0).toUpperCase();

    return (
        <Screen className="gap-5">
            <View className="flex-row items-center gap-3">
                <BackButton />
                <Text className="font-jakarta-extrabold text-2xl tracking-tight">Profile</Text>
            </View>

            <View className="items-center gap-3">
                <View className="border-foreground bg-amber shadow-nb h-20 w-20 items-center justify-center rounded-full border-2">
                    <Text className="font-jakarta-extrabold text-3xl text-black">{initial}</Text>
                </View>
                <View className="items-center gap-0.5">
                    <Text className="font-jakarta-extrabold text-2xl tracking-tight">{user.name}</Text>
                    <Text className="text-muted-foreground font-jakarta-bold text-sm">@{user.username}</Text>
                </View>
            </View>

            <LevelCard loading={false} experience={user.experience} />
            <StreakCard loading={false} streak={user.streak} longestStreak={user.longestStreak} />

            <View className="flex-row flex-wrap gap-3">
                <View className="card flex-1 items-center gap-1.5">
                    <Flame size={20} color="#DC2626" fill="#DC2626" strokeWidth={2.5} />
                    <Text className="font-jakarta-extrabold text-2xl tracking-tight">{user.streak}</Text>
                    <Text className="text-muted-foreground font-jakarta-bold text-xs">Current Streak</Text>
                </View>
                <View className="card flex-1 items-center gap-1.5">
                    <Trophy size={20} color="#f59e0b" strokeWidth={2.5} />
                    <Text className="font-jakarta-extrabold text-2xl tracking-tight">{user.longestStreak}</Text>
                    <Text className="text-muted-foreground font-jakarta-bold text-xs">Best Streak</Text>
                </View>
                <View className="card flex-1 items-center gap-1.5">
                    <Sparkles size={20} color="#7c3aed" strokeWidth={2.5} />
                    <Text className="font-jakarta-extrabold text-2xl tracking-tight">{user.experience}</Text>
                    <Text className="text-muted-foreground font-jakarta-bold text-xs">Total XP</Text>
                </View>
            </View>

            <View className="card flex-row items-center gap-2.5">
                <CheckCircle2 size={18} color="#65a30d" strokeWidth={2.5} />
                <Text className="text-muted-foreground font-jakarta-bold text-xs">Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</Text>
            </View>
        </Screen>
    );
}
