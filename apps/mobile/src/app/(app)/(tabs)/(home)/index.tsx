import ActivityCard from "@/components/activity-card";
import ErrorMessage from "@/components/error-message";
import LevelCard from "@/components/level-card";
import QuestCard from "@/components/quest-card";
import SectionHeader from "@/components/section-header";
import StatCard from "@/components/stat-card";
import StreakCard from "@/components/streak-card";
import Button from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import Screen from "@/components/ui/screen";
import Text from "@/components/ui/text";
import { useColor } from "@/hooks/custom/use-color";
import useRefetchOnFocus from "@/hooks/custom/use-refetch";
import { defaultDashboard, useGetDashboard } from "@/hooks/tan-stack/dashboard";
import { useGetMyQuests } from "@/hooks/tan-stack/quest";
import { useGetMyQuestActivities } from "@/hooks/tan-stack/quest-activity";
import { useGetUser } from "@/hooks/tan-stack/user";
import { displayValue } from "@/utils/helper-functions";
import { keepPreviousData } from "@tanstack/react-query";
import { router } from "expo-router";
import { Activity, Plus, Target, Trophy, Users } from "lucide-react-native";
import { View } from "react-native";

export default function Home() {
    const color = useColor();

    const { data: user, error, isPending: userPending, refetch: refetchUser } = useGetUser();
    const { data: quests = [], refetch: refetchQuests } = useGetMyQuests("Active", { placeholderData: keepPreviousData });
    const { data: activities = [], refetch: refetchActivities } = useGetMyQuestActivities({ placeholderData: keepPreviousData });
    const { data: dashboard = defaultDashboard, isPending: dashboardPending, refetch: refetchDashboard } = useGetDashboard({ placeholderData: keepPreviousData });

    useRefetchOnFocus(refetchUser);
    useRefetchOnFocus(refetchQuests);
    useRefetchOnFocus(refetchDashboard);
    useRefetchOnFocus(refetchActivities);

    if (error || (!userPending && !user)) {
        return (
            <Screen fullscreen className="items-center justify-center">
                <ErrorMessage message={error.message ?? "User not found"} />
            </Screen>
        );
    }

    const activeQuests = quests.slice(0, 3);

    return (
        <Screen className="gap-6">
            <View className="gap-0.5">
                <Text className="font-jakarta-extrabold text-foreground text-3xl tracking-tight">Hey, {displayValue(userPending, user?.name ?? "")} 👋</Text>
                <Text className="text-muted-foreground font-jakarta-bold text-sm">Ready to level up today?</Text>
            </View>

            <StreakCard loading={userPending} streak={user?.streak ?? 0} longestStreak={user?.longestStreak ?? 0} />

            <LevelCard loading={userPending} experience={user?.experience ?? 0} />

            <View className="flex-row gap-3">
                <StatCard label="Today" value={displayValue(dashboardPending, dashboard.todayCompleted)} accent="bg-lime" />
                <StatCard label="This Week" value={displayValue(dashboardPending, dashboard.weekCompleted)} accent="bg-pink" />
            </View>

            <View className="flex-row gap-3">
                <StatCard label="Today XP" value={displayValue(dashboardPending, `+${dashboard.todayXp}`)} accent="bg-amber" />
                <StatCard label="Weekly XP" value={displayValue(dashboardPending, `+${dashboard.weekXp}`)} accent="bg-purple" />
            </View>

            <View className="gap-2.5">
                <Text className="font-jakarta-extrabold text-xl tracking-tight">Quick Actions</Text>
                <View className="flex-row gap-3">
                    <Button size="lg" asChild className="flex-1" onPress={() => router.push("/(app)/(home)/(quests)/create")}>
                        <Plus size={18} color={color.black} strokeWidth={3} />
                        <Text className="font-jakarta-extrabold text-black">Create Quest</Text>
                    </Button>

                    <Button size="lg" variant="outline" asChild className="flex-1" onPress={() => router.push("/(app)/(parties)/create")}>
                        <Users size={18} color={color.foreground} strokeWidth={2.5} />
                        <Text className="font-jakarta-extrabold">Create Party</Text>
                    </Button>
                </View>
            </View>

            <SectionHeader title="Active Quests" icon={Target} action="View all" onAction={() => router.push("/(app)/(home)/(quests)")} badge={`${quests.filter((q) => q.status === "Active").length} Pending`} badgeColor="bg-lime" />

            <View className="gap-3">
                {activeQuests.length > 0 ? (
                    activeQuests.map((quest) => (
                        <QuestCard key={quest.id} quest={quest} onPress={() => router.push({ pathname: "/(app)/(tabs)/(home)/(quests)/[id]", params: { id: quest.id, code: quest.party.code } })} />
                    ))
                ) : (
                    <View className="card p-0">
                        <EmptyState icon={Trophy} title="No active quests" description="Create a quest to get started!" actionLabel="Create Quest" onAction={() => router.push("/(app)/(home)/(quests)/create")} />
                    </View>
                )}
            </View>

            <SectionHeader title="Recent Activity" icon={Activity} action="View all" onAction={() => router.push("/(app)/(home)/activity")} />

            <View className="card p-2">
                {activities.length > 0 ? (
                    activities.slice(0, 3).map((activity, index) => (
                        <View key={activity.completedAt + index}>
                            <ActivityCard activity={activity} />
                            {index < Math.min(activities.length, 3) - 1 && <View className="border-border mx-1 border-b" />}
                        </View>
                    ))
                ) : (
                    <View className="py-8">
                        <Text className="text-muted-foreground font-jakarta-bold text-center text-sm">No activity yet</Text>
                    </View>
                )}
            </View>
        </Screen>
    );
}
