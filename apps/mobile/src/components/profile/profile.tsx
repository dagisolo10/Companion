import { CheckCircle2, Flame, Globe, Lock, Sparkles, Trophy } from "lucide-react-native";
import { SkeletonBlock, SkeletonCard } from "@/components/ui/skeleton";
import StreakCard from "@/components/profile/streak-card";
import BackButton from "@/components/common/back-button";
import LevelCard from "@/components/profile/level-card";
import { useColor } from "@/hooks/custom/use-color";
import { formatDateTime } from "@/utils/formatters";
import { User } from "@companion/shared-types";
import Screen from "@/components/ui/screen";
import Text from "@/components/ui/text";
import { View } from "react-native";
import { cn } from "cn";


export default function ProfileView({ user, visibility = false }: { user: User; visibility?: boolean }) {
    const color = useColor();
    const isPublic = user.public;

    return (
        <View className="gap-5">
            <View className="items-center gap-3">
                <View className="border-foreground bg-amber shadow-nb h-20 w-20 items-center justify-center rounded-full border-2">
                    <Text className="text-3xl font-extrabold text-black">{user.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View className="items-center gap-0.5">
                    <Text className="text-2xl font-extrabold tracking-tight">{user.name}</Text>
                    <Text className="text-muted-foreground text-sm font-bold">@{user.username}</Text>
                </View>
            </View>

            <StreakCard loading={false} streak={user.streak} longestStreak={user.longestStreak} />
            <LevelCard loading={false} experience={user.experience} />

            {visibility && (
                <View className="card flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2.5">
                        {isPublic ? <Globe size={18} color="#22C55E" strokeWidth={2.5} /> : <Lock size={18} color={color.mutedForeground} strokeWidth={2.5} />}
                        <View>
                            <Text className="text-xs font-bold">{isPublic ? "Public Profile" : "Private Profile"}</Text>
                            <Text className="text-muted-foreground text-[11px] font-medium">{isPublic ? "Visible in search & leaderboards" : "Hidden from search & public view"}</Text>
                        </View>
                    </View>

                    <View className={cn("border-foreground rounded-full border-2 px-2 py-0.5", isPublic ? "bg-lime" : "bg-muted")}>
                        <Text className="text-[10px] font-extrabold text-black uppercase">{isPublic ? "Public" : "Private"}</Text>
                    </View>
                </View>
            )}

            <View className="flex-row flex-wrap gap-3">
                <View className="card flex-1 items-center gap-1.5">
                    <Flame size={20} color="#DC2626" fill="#DC2626" strokeWidth={2.5} />
                    <Text className="text-2xl font-extrabold tracking-tight">{user.streak}</Text>
                    <Text className="text-muted-foreground text-xs font-bold">Current Streak</Text>
                </View>
                <View className="card flex-1 items-center gap-1.5">
                    <Trophy size={20} color="#f59e0b" strokeWidth={2.5} />
                    <Text className="text-2xl font-extrabold tracking-tight">{user.longestStreak}</Text>
                    <Text className="text-muted-foreground text-xs font-bold">Best Streak</Text>
                </View>
                <View className="card flex-1 items-center gap-1.5">
                    <Sparkles size={20} color="#7c3aed" strokeWidth={2.5} />
                    <Text className="text-2xl font-extrabold tracking-tight">{user.experience}</Text>
                    <Text className="text-muted-foreground text-xs font-bold">Total XP</Text>
                </View>
            </View>

            <View className="card flex-row items-center gap-2.5">
                <CheckCircle2 size={18} color="#65a30d" strokeWidth={2.5} />
                <Text className="text-muted-foreground text-xs font-bold">Joined {formatDateTime(user.createdAt)}</Text>
            </View>
        </View>
    );
}

export function SkeletonProfileView({ back }: { back?: boolean }) {
    return (
        <Screen className="gap-5">
            {back && <BackButton label="Profile" />}

            <View className="items-center gap-3">
                <SkeletonBlock index={0} className="border-foreground bg-amber size-20 rounded-full border-2" />
                <View className="items-center gap-1.5">
                    <SkeletonBlock index={1} className="h-7 w-36" />
                    <SkeletonBlock index={2} className="h-4 w-24" />
                </View>
            </View>

            <SkeletonCard lines={2} className="bg-amber" />

            <View className="card gap-3">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2.5">
                        <SkeletonBlock index={3} className="border-foreground h-9 w-9 border-2" />
                        <View className="gap-1">
                            <SkeletonBlock index={4} className="h-5 w-20" />
                            <SkeletonBlock index={5} className="h-3 w-28" />
                        </View>
                    </View>
                    <SkeletonBlock index={6} className="border-foreground h-7 w-20 border-2" />
                </View>
                <View className="gap-1.5">
                    <SkeletonBlock index={7} className="h-3 w-full" />
                    <View className="flex-row items-center justify-between">
                        <SkeletonBlock index={8} className="h-3 w-12" />
                        <SkeletonBlock index={9} className="h-3 w-32" />
                    </View>
                </View>
            </View>

            <View className="flex-row flex-wrap gap-3">
                <SkeletonCard lines={2} className="flex-1" />
                <SkeletonCard lines={2} className="flex-1" />
                <SkeletonCard lines={2} className="flex-1" />
            </View>

            <SkeletonCard lines={1} />
        </Screen>
    );
}
