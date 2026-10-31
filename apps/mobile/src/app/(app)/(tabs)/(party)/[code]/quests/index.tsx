import BackButton from "@/components/common/back-button";
import ErrorMessage from "@/components/common/error-message";
import QuestCard from "@/components/quest/quest-card";
import Button from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import Screen from "@/components/ui/screen";
import { SkeletonQuestCard } from "@/components/ui/skeleton";
import Text from "@/components/ui/text";
import useConfirmDialog from "@/hooks/custom/use-confirm-dialog";
import useToast from "@/hooks/custom/use-toast";
import { useCompleteQuest, useGetPartyQuestsInfinite } from "@/hooks/tan-stack/quest";
import { Filter, Quest } from "@companion/shared-types";
import { cn } from "cn";
import { router, useLocalSearchParams } from "expo-router";
import { CheckCircle2, Sparkles } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, FlatList, ScrollView, View } from "react-native";

export default function PartyQuests() {
    const { code } = useLocalSearchParams<{ code: string }>();
    const [filter, setFilter] = useState<Filter>("All");
    const tabs: Filter[] = ["All", "Upcoming", "Active", "Completed", "Expired"];

    const questsQuery = useGetPartyQuestsInfinite(code, filter);
    const completeQuestMutation = useCompleteQuest();
    const { showConfirmDialog, confirmDialog } = useConfirmDialog();
    const { showToast } = useToast();

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
                        onSuccess: () => showToast({ title: "Quest completed", description: "Your completion has been recorded.", variant: "success" }),
                        onError: (err) => showToast({ title: "Could not complete quest", description: err.message || "Please try again.", variant: "error" }),
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
                keyExtractor={(quest) => quest.id}
                contentContainerStyle={{ gap: 12, paddingBottom: 24, flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                onEndReached={() => {
                    if (questsQuery.hasNextPage && !questsQuery.isFetchingNextPage) void questsQuery.fetchNextPage();
                }}
                onEndReachedThreshold={0.5}
                ListHeaderComponent={
                    <View className="mb-5 gap-5">
                        <BackButton label="Quests" />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View className="flex-row gap-2">
                                {tabs.map((tab) => (
                                    <Button key={tab} variant={filter === tab ? "default" : "secondary"} onPress={() => setFilter(tab)} className="px-4">
                                        <Text className={cn("font-jakarta-extrabold text-center text-sm", filter === tab ? "text-black" : "text-foreground")}>{tab}</Text>
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
                            actionLabel={filter === "All" ? "Create Quest" : undefined}
                            onAction={filter === "All" ? () => router.push({ pathname: "/(app)/(tabs)/(party)/[code]/quests/create", params: { code } }) : undefined}
                            title={`No ${filter === "All" ? "" : filter.toLowerCase() + " "}quests`}
                            description={filter === "All" ? "Create a quest to get started!" : `There are no ${filter.toLowerCase()} quests.`}
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
