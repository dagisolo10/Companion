import ActivityCard from "@/components/activity-card";
import BackButton from "@/components/back-button";
import LevelCard from "@/components/level-card";
import SectionHeader from "@/components/section-header";
import StatCard from "@/components/stat-card";
import StreakCard from "@/components/streak-card";
import EmptyState from "@/components/ui/empty-state";
import Screen from "@/components/ui/screen";
import Text from "@/components/ui/text";
import { defaultDashboard, useGetDashboard } from "@/hooks/tan-stack/dashboard";
import { useGetMyQuestActivities } from "@/hooks/tan-stack/quest-activity";
import { useGetUser } from "@/hooks/tan-stack/user";
import { Activity, Calendar, Trophy, Zap } from "lucide-react-native";
import { View } from "react-native";

function groupActivities(activities: NonNullable<ReturnType<typeof useGetMyQuestActivities>["data"]>) {
    const now = new Date();
    const today: typeof activities = [];
    const yesterday: typeof activities = [];
    const thisWeek: typeof activities = [];
    const older: typeof activities = [];

    for (const a of activities) {
        const d = new Date(a.completedAt);
        const diffMs = now.getTime() - d.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (diffDays < 1) today.push(a);
        else if (diffDays < 2) yesterday.push(a);
        else if (diffDays < 7) thisWeek.push(a);
        else older.push(a);
    }

    return { today, yesterday, thisWeek, older };
}

const GROUPS = [
    { key: "today" as const, label: "Today" },
    { key: "yesterday" as const, label: "Yesterday" },
    { key: "thisWeek" as const, label: "This Week" },
    { key: "older" as const, label: "Older" },
];

export default function Dashboard() {
    const { data: user, error, isFetching: userLoading } = useGetUser();
    const { data: dashboard = defaultDashboard } = useGetDashboard();
    const { data: activities = [] } = useGetMyQuestActivities();

    if (error || !user) {
        return (
            <Screen fullscreen className="items-center justify-center">
                <Text className="text-muted-foreground">Something went wrong</Text>
            </Screen>
        );
    }

    const grouped = groupActivities(activities);

    return (
        <Screen className="gap-6">
            <View className="flex-row items-center gap-3">
                <BackButton />
                <Text className="font-jakarta-extrabold text-2xl tracking-tight">Dashboard</Text>
            </View>

            <LevelCard loading={userLoading} experience={user.experience} />

            <StreakCard loading={userLoading} streak={user.streak} longestStreak={user.longestStreak} />

            <SectionHeader title="Quest Completions" icon={Trophy} />

            <View className="flex-row gap-3">
                <StatCard label="Today" value={dashboard?.todayCompleted ?? 0} accent="bg-lime" />
                <StatCard label="This Week" value={dashboard?.weekCompleted ?? 0} accent="bg-amber" />
            </View>

            <View className="flex-row gap-3">
                <StatCard label="This Month" value={dashboard?.monthCompleted ?? 0} accent="bg-pink" />
                <StatCard label="All Time" value={dashboard?.allTimeCompleted ?? 0} accent="bg-purple" />
            </View>

            <SectionHeader title="XP Earned" icon={Zap} />

            <View className="flex-row gap-3">
                <StatCard label="Today" value={`+${dashboard?.todayXp ?? 0}`} accent="bg-amber" />
                <StatCard label="This Week" value={`+${dashboard?.weekXp ?? 0}`} accent="bg-lime" />
            </View>

            <View className="flex-row gap-3">
                <StatCard label="This Month" value={`+${dashboard?.monthXp ?? 0}`} accent="bg-pink" />
                <StatCard label="All Time" value={`+${dashboard?.allTimeXp ?? 0}`} accent="bg-purple" />
            </View>

            <SectionHeader title="Activity History" icon={Activity} badge={`${activities.length} total`} />

            {activities.length > 0 ? (
                GROUPS.map(({ key, label }) => {
                    const items = grouped[key];
                    if (items.length === 0) return null;
                    return (
                        <View key={key} className="gap-3">
                            <Text className="text-muted-foreground font-jakarta-extrabold text-xs tracking-wider uppercase">{label}</Text>
                            <View className="border-foreground bg-card shadow-nb divide-border/60 rounded-2xl border-2 p-2">
                                {items.map((activity, index) => (
                                    <View key={activity.completedAt + index}>
                                        <ActivityCard activity={activity} />
                                        {index < items.length - 1 && <View className="border-border mx-1 border-b" />}
                                    </View>
                                ))}
                            </View>
                        </View>
                    );
                })
            ) : (
                <EmptyState icon={Calendar} title="No activity yet" description="Complete a quest to see your history here." />
            )}

            <View className="mb-4" />
        </Screen>
    );
}
