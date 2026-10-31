import ActivityCard from "@/components/activity/activity-card";
import BackButton from "@/components/common/back-button";
import EmptyState from "@/components/ui/empty-state";
import Screen from "@/components/ui/screen";
import { SkeletonCard } from "@/components/ui/skeleton";
import Text from "@/components/ui/text";
import { useGetMyQuestActivitiesInfinite } from "@/hooks/tan-stack/quest-activity";
import { groupActivities } from "@/utils/helper-functions";
import { Activity as ActivityIcon } from "lucide-react-native";
import { useMemo } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";

const GROUPS = [
    { key: "today" as const, label: "Today" },
    { key: "yesterday" as const, label: "Yesterday" },
    { key: "thisWeek" as const, label: "This Week" },
    { key: "older" as const, label: "Older" },
];

export default function Activity() {
    const myQuestActivitiesQuery = useGetMyQuestActivitiesInfinite();

    const sections = useMemo(() => {
        const grouped = groupActivities(myQuestActivitiesQuery.data);
        return GROUPS.map(({ key, label }) => ({ key, label, items: grouped[key] })).filter((section) => section.items.length > 0);
    }, [myQuestActivitiesQuery.data]);

    if (myQuestActivitiesQuery.isLoading) {
        return (
            <Screen className="gap-5">
                <BackButton label="Activity" />
                <SkeletonCard lines={4} />
                <SkeletonCard lines={4} />
                <SkeletonCard lines={4} />
                <SkeletonCard lines={4} />
                <SkeletonCard lines={4} />
            </Screen>
        );
    }

    if (myQuestActivitiesQuery.error) {
        return (
            <Screen fullscreen className="items-center justify-center">
                <Text className="text-destructive text-sm">{myQuestActivitiesQuery.error.message}</Text>
            </Screen>
        );
    }

    return (
        <Screen nonScrollable>
            <FlatList
                data={sections}
                style={{ flex: 1 }}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                keyExtractor={(section) => section.label}
                contentContainerStyle={{ gap: 20, paddingBottom: 24 }}
                ListHeaderComponent={<BackButton label="Activity" />}
                ListEmptyComponent={<EmptyState icon={ActivityIcon} title="No activity yet" description="Complete a quest to see your history here." />}
                onEndReached={() => {
                    if (myQuestActivitiesQuery.hasNextPage && !myQuestActivitiesQuery.isFetchingNextPage) void myQuestActivitiesQuery.fetchNextPage();
                }}
                renderItem={({ item: section }) => (
                    <View className="gap-3">
                        <Text className="text-muted-foreground font-jakarta-extrabold text-xs tracking-wider uppercase">{section.label}</Text>
                        <View className="border-foreground bg-card shadow-nb divide-border/60 rounded-2xl border-2 p-2">
                            {section.items.map((activity, index) => (
                                <View key={activity.id} className={index !== section.items.length - 1 ? "border-border border-b" : undefined}>
                                    <ActivityCard activity={activity} />
                                    {index < section.items.length - 1 && <View className="border-border mx-1 border-b" />}
                                </View>
                            ))}
                        </View>
                    </View>
                )}
                ListFooterComponent={myQuestActivitiesQuery.isFetchingNextPage ? <ActivityIndicator /> : undefined}
            />
        </Screen>
    );
}
