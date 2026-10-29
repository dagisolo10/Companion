import { useCompleteQuest, useGetMyQuestsInfinite } from "@/hooks/tan-stack/quest";
import { SkeletonQuestCard } from "@/components/ui/skeleton";
import { CheckCircle2, Sparkles } from "lucide-react-native";
import ErrorMessage from "@/components/error-message";
import EmptyState from "@/components/ui/empty-state";
import BackButton from "@/components/back-button";
import QuestCard from "@/components/quest-card";
import { Filter, Quest } from "@/types/models";
import Screen from "@/components/ui/screen";
import Button from "@/components/ui/button";
import { ActivityIndicator, Alert, FlatList, View } from "react-native";
import Text from "@/components/ui/text";
import { router } from "expo-router";
import { useState } from "react";
import { cn } from "cn";


export default function MyQuests() {
    const [filter, setFilter] = useState<Filter>("All");
    const tabs: Filter[] = ["All", "Active", "Completed"];

    const questsQuery = useGetMyQuestsInfinite(filter);
    const completeQuestMutation = useCompleteQuest();

    const isLoading = questsQuery.isLoading;

    function handleComplete(quest: Quest) {
        Alert.alert("Complete Quest", `Mark "${quest.title}" as completed?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Complete",
                onPress: () => completeQuestMutation.mutate({ id: quest.id, code: quest.party.code }, { onSuccess: () => Alert.alert("Done", "Quest completed!"), onError: (err) => Alert.alert("Error", err.message || "Failed to complete quest") }),
            },
        ]);
    }

    if (questsQuery.error) {
        return (
            <Screen fullscreen className="items-center justify-center">
                <ErrorMessage message={questsQuery.error.message ?? "Failed to load quests"} />
            </Screen>
        );
    }

    return (
        <Screen nonScrollable>
            <FlatList
                style={{ flex: 1 }}
                data={questsQuery.data}
                keyExtractor={(quest) => quest.id}
                contentContainerStyle={{ gap: 12, paddingBottom: 24, flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                onEndReached={() => { if (questsQuery.hasNextPage && !questsQuery.isFetchingNextPage) void questsQuery.fetchNextPage(); }}
                onEndReachedThreshold={0.5}
                ListHeaderComponent={<View className="mb-5 gap-5"><BackButton label="My Quests" /><View className="flex-row gap-2">{tabs.map((tab) => <Button key={tab} variant={filter === tab ? "default" : "secondary"} onPress={() => setFilter(tab)} className={cn("flex-1")}><Text className={cn("text-center text-sm font-extrabold", filter === tab ? "text-black" : "text-foreground")}>{tab}</Text></Button>)}</View></View>}
                ListEmptyComponent={isLoading ? <View className="gap-3"><SkeletonQuestCard /><SkeletonQuestCard /><SkeletonQuestCard /></View> : <EmptyState icon={filter === "Completed" ? CheckCircle2 : Sparkles} actionLabel={filter === "All" ? "Browse Parties" : undefined} onAction={filter === "All" ? () => router.push("/(app)/(tabs)/(party)") : undefined} title={filter === "Completed" ? "No completed quests" : filter === "Active" ? "No active quests" : "No quests yet"} description={filter === "All" ? "Join a party to start questing!" : `You have no ${filter.toLowerCase()} quests.`} />}
                renderItem={({ item: quest }) => (
                    <QuestCard
                        quest={quest}
                        onComplete={() => handleComplete(quest)}
                        showComplete={quest.status === "Active" && (quest.questActivities?.length ?? 0) === 0}
                        onPress={() => router.push({ pathname: "/(app)/(tabs)/(party)/[code]/quests/[id]", params: { id: quest.id, code: quest.party.code } })}
                    />
                )}
                ListFooterComponent={questsQuery.isFetchingNextPage ? <ActivityIndicator /> : undefined}
            />
        </Screen>
    );
}
