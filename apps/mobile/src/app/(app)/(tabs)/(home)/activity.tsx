import ActivityCard from "@/components/activity-card";
import BackButton from "@/components/back-button";
import EmptyState from "@/components/ui/empty-state";
import Screen from "@/components/ui/screen";
import { SkeletonCard } from "@/components/ui/skeleton";
import Text from "@/components/ui/text";
import { useGetMyQuestActivities } from "@/hooks/tan-stack/quest-activity";
import { Activity as ActivityIcon } from "lucide-react-native";
import { View } from "react-native";

export default function Activity() {
    const { data: activities = [], isFetching, error } = useGetMyQuestActivities();

    if (isFetching) {
        return (
            <Screen className="gap-5">
                <View className="flex-row items-center gap-3">
                    <BackButton />
                    <Text className="font-jakarta-extrabold text-2xl tracking-tight">Activity</Text>
                </View>
                <SkeletonCard lines={4} />
            </Screen>
        );
    }

    if (error) {
        return (
            <Screen fullscreen className="items-center justify-center">
                <Text className="text-destructive text-sm">{error.message}</Text>
            </Screen>
        );
    }

    return (
        <Screen className="gap-5">
            <View className="flex-row items-center gap-3">
                <BackButton />
                <Text className="font-jakarta-extrabold text-2xl tracking-tight">Activity</Text>
            </View>

            {activities.length === 0 ? (
                <EmptyState icon={ActivityIcon} title="No activity yet" description="Complete a quest and it will show up here." />
            ) : (
                <View className="border-foreground bg-card shadow-nb divide-border/60 rounded-2xl border-2 p-2">
                    {activities.map((activity, index) => (
                        <View key={index} className={index !== activities.length - 1 ? "border-border border-b" : undefined}>
                            <ActivityCard activity={activity} />
                        </View>
                    ))}
                </View>
            )}
        </Screen>
    );
}
