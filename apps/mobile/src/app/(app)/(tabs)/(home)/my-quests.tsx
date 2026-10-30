import BackButton from "@/components/common/back-button";
import ErrorMessage from "@/components/common/error-message";
import QuestCard from "@/components/quest/quest-card";
import Button from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import Screen from "@/components/ui/screen";
import { SkeletonQuestCard } from "@/components/ui/skeleton";
import Text from "@/components/ui/text";
import { useCompleteQuest, useGetMyQuestsInfinite } from "@/hooks/tan-stack/quest";
import useConfirmDialog from "@/hooks/custom/use-confirm-dialog";
import { Filter, Quest } from "@/types/models";
import { cn } from "cn";
import { router } from "expo-router";
import { CheckCircle2, Sparkles } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, FlatList, ScrollView, View } from "react-native";

export default function MyQuests() {
    const [filter, setFilter] = useState<Filter>("All");
    const tabs: Filter[] = ["All", "Upcoming", "Active", "Completed", "Expired"];

    const questsQuery = useGetMyQuestsInfinite(filter);
    const completeQuestMutation = useCompleteQuest();
    const { showConfirmDialog, confirmDialog } = useConfirmDialog();

    const isLoading = questsQuery.isLoading;

    function handleComplete(quest: Quest) {
        showConfirmDialog({
            title: "Complete Quest",
            description: `Mark "${quest.title}" as completed?`,
            confirmLabel: "Complete",
            onConfirm: () =>
                completeQuestMutation.mutate(
                    { id: quest.id, code: quest.party.code },
                    {
                        onSuccess: () => showConfirmDialog({ title: "Done", description: "Quest completed!" }),
                        onError: (err) => showConfirmDialog({ title: "Error", description: err.message || "Failed to complete quest" }),
                    },
                ),
        });
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
            {confirmDialog}
            <FlatList
                style={{ flex: 1 }}
                data={questsQuery.data}
                onEndReachedThreshold={0.5}
                keyExtractor={(quest) => quest.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingBottom: 24, flexGrow: 1 }}
                onEndReached={() => {
                    if (questsQuery.hasNextPage && !questsQuery.isFetchingNextPage) void questsQuery.fetchNextPage();
                }}
                ListHeaderComponent={
                    <View className="mb-5 gap-5">
                        <BackButton label="My Quests" />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View className="flex-row gap-2">
                                {tabs.map((tab) => (
                                    <Button key={tab} variant={filter === tab ? "default" : "secondary"} onPress={() => setFilter(tab)} className="px-4">
                                        <Text className={cn("text-center text-sm font-extrabold", filter === tab ? "text-black" : "text-foreground")}>{tab}</Text>
                                    </Button>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                }
                ListEmptyComponent={
                    isLoading ? (
                        <View className="gap-3">
                            <SkeletonQuestCard />
                            <SkeletonQuestCard />
                            <SkeletonQuestCard />
                        </View>
                    ) : (
                        <EmptyState
                            icon={filter === "Completed" ? CheckCircle2 : Sparkles}
                            actionLabel={filter === "All" ? "Browse Parties" : undefined}
                            onAction={filter === "All" ? () => router.push("/(app)/(tabs)/(party)") : undefined}
                            title={`No ${filter === "All" ? "" : filter.toLowerCase() + " "}quests`}
                            description={filter === "All" ? "Join a party to start questing!" : `You have no ${filter.toLowerCase()} quests.`}
                        />
                    )
                }
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
