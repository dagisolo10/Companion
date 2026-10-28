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
import { useGetDashboard } from "@/hooks/tan-stack/dashboard";
import { useGetMyQuests } from "@/hooks/tan-stack/quest";
import { useGetMyQuestActivities } from "@/hooks/tan-stack/quest-activity";
import { useGetUser } from "@/hooks/tan-stack/user";
import { loadValue } from "@/utils/helper-functions";
import { router } from "expo-router";
import { Activity, Map, Plus, Target, Trophy, Users, Zap } from "lucide-react-native";
import { View } from "react-native";

export default function Home() {
    const color = useColor();

    const userQuery = useGetUser();
    const dashboardQuery = useGetDashboard();
    const myQuestsQuery = useGetMyQuests("Active", 3);
    const myQuestActivitiesQuery = useGetMyQuestActivities(3);

    if (userQuery.error || (!userQuery.isPending && !userQuery.data)) {
        return (
            <Screen fullscreen className="items-center justify-center">
                <ErrorMessage message={userQuery.error.message ?? "User not found"} />
            </Screen>
        );
    }

    return (
        <Screen className="gap-6">
            <View>
                <Text className="font-bebas text-5xl">{loadValue(userQuery.isPending, userQuery.data?.name ?? "")} 👋</Text>
                <Text className="text-muted-foreground text-sm font-bold">Ready to level up today?</Text>
            </View>

            <StreakCard loading={userQuery.isPending} streak={userQuery.data?.streak ?? 0} longestStreak={userQuery.data?.longestStreak ?? 0} />
            <LevelCard loading={userQuery.isPending} experience={userQuery.data?.experience ?? 0} />

            <View className="gap-3">
                <SectionHeader title="XP Earned" icon={Zap} />
                <View className="flex-row gap-3">
                    <StatCard label="Today" value={`+${dashboardQuery.data.todayXp}`} accent="bg-amber" loading={dashboardQuery.isPending} />
                    <StatCard label="This Week" value={`+${dashboardQuery.data.weekXp}`} accent="bg-lime" loading={dashboardQuery.isPending} />
                </View>
                <View className="flex-row gap-3">
                    <StatCard label="This Month" value={`+${dashboardQuery.data.monthXp}`} accent="bg-pink" loading={dashboardQuery.isPending} />
                    <StatCard label="All Time" value={`+${dashboardQuery.data.allTimeXp}`} accent="bg-purple" loading={dashboardQuery.isPending} />
                </View>
            </View>

            <View className="gap-3">
                <SectionHeader title="Quest Completions" icon={Trophy} />
                <View className="flex-row gap-3">
                    <StatCard label="Today" value={dashboardQuery.data.todayCompleted} accent="bg-lime" loading={dashboardQuery.isPending} />
                    <StatCard label="This Week" value={dashboardQuery.data.weekCompleted} accent="bg-amber" loading={dashboardQuery.isPending} />
                </View>
                <View className="flex-row gap-3">
                    <StatCard label="This Month" value={dashboardQuery.data.monthCompleted} accent="bg-pink" loading={dashboardQuery.isPending} />
                    <StatCard label="All Time" value={dashboardQuery.data.allTimeCompleted} accent="bg-purple" loading={dashboardQuery.isPending} />
                </View>
            </View>

            <View className="gap-2.5">
                <SectionHeader title="Quick Actions" icon={Map} />
                <View className="flex-row gap-3">
                    <Button size="lg" asChild className="flex-1" onPress={() => router.push("/(app)/(tabs)/(parties)/[code]/(quests)/create")}>
                        <Plus size={18} color={color.black} strokeWidth={3} />
                        <Text className="font-extrabold text-black">Create Quest</Text>
                    </Button>

                    <Button size="lg" variant="outline" asChild className="flex-1" onPress={() => router.push("/(app)/(parties)/create")}>
                        <Users size={18} color={color.foreground} strokeWidth={2.5} />
                        <Text className="font-extrabold">Create Party</Text>
                    </Button>
                </View>
            </View>

            <SectionHeader
                icon={Target}
                action="View all"
                badgeColor="bg-lime"
                title="Active Quests"
                badge={`${myQuestsQuery.data.length} Pending`}
                onAction={() => {
                    const code = myQuestsQuery.data?.[0]?.party?.code;
                    if (code) router.push({ pathname: "/(app)/(tabs)/(parties)/[code]/(quests)", params: { code } });
                }}
            />

            <View className="gap-3">
                {myQuestsQuery.data.length > 0 ? (
                    myQuestsQuery.data.map((quest) => <QuestCard key={quest.id} quest={quest} onPress={() => router.push({ pathname: "/(app)/(tabs)/(parties)/[code]/(quests)/[id]", params: { id: quest.id, code: quest.party.code } })} />)
                ) : (
                    <View className="card p-0">
                        <EmptyState
                            icon={Trophy}
                            title="No active quests"
                            description="Create a quest to get started!"
                            actionLabel="Create Quest"
                            onAction={() => {
                                const c = myQuestsQuery.data?.[0]?.party?.code;
                                if (c) router.push({ pathname: "/(app)/(tabs)/(parties)/[code]/(quests)/create", params: { code: c } });
                            }}
                        />
                    </View>
                )}
            </View>

            <SectionHeader title="Recent Activity" icon={Activity} action="View all" onAction={() => router.push("/(app)/(home)/activity")} />

            <View className="card p-2">
                {myQuestActivitiesQuery.data.length > 0 ? (
                    myQuestActivitiesQuery.data.map((activity, index) => (
                        <View key={activity.id}>
                            <ActivityCard activity={activity} />
                            {index < Math.min(myQuestActivitiesQuery.data.length, 3) - 1 && <View className="border-border mx-1 border-b" />}
                        </View>
                    ))
                ) : (
                    <View className="py-8">
                        <Text className="text-muted-foreground text-center text-sm font-bold">No activity yet</Text>
                    </View>
                )}
            </View>
        </Screen>
    );
}
