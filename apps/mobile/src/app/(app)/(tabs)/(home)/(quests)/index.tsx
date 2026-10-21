import BackButton from "@/components/back-button";
import ErrorMessage from "@/components/error-message";
import QuestCard from "@/components/quest-card";
import EmptyState from "@/components/ui/empty-state";
import Screen from "@/components/ui/screen";
import { SkeletonQuestList } from "@/components/ui/skeleton";
import Text from "@/components/ui/text";
import useRefetchOnFocus from "@/hooks/custom/use-refetch";
import { useCompleteQuest, useGetMyQuests } from "@/hooks/tan-stack/quest";
import { cn } from "@/lib/utils";
import { Filter, Quest } from "@/types/models";
import { keepPreviousData } from "@tanstack/react-query";
import { router } from "expo-router";
import { CheckCircle2, Sparkles } from "lucide-react-native";
import { useState } from "react";
import { Alert, View } from "react-native";

export default function MyQuests() {
    const [filter, setFilter] = useState<Filter>("All");

    const { mutate: completeQuest } = useCompleteQuest();
    const { data: quests = [], refetch: refetchQuests, isPending: questPending, error } = useGetMyQuests(filter, { placeholderData: keepPreviousData });

    useRefetchOnFocus(refetchQuests);

    function handleComplete(quest: Quest) {
        Alert.alert("Complete Quest", `Mark "${quest.title}" as completed?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Complete", onPress: () => completeQuest({ id: quest.id, code: quest.party.code }, { onSuccess: () => Alert.alert("Done", "Quest completed!"), onError: (err) => Alert.alert("Error", err.message || "Failed to complete quest") }) },
        ]);
    }

    if (questPending) {
        return (
            <Screen className="gap-5">
                <View className="flex-row items-center gap-3">
                    <BackButton />
                    <Text className="font-jakarta-extrabold text-2xl tracking-tight">My Quests</Text>
                </View>
                <SkeletonQuestList count={7} />
            </Screen>
        );
    }

    if (error) {
        return (
            <Screen fullscreen className="items-center justify-center">
                <ErrorMessage message={error.message ?? "User not found"} />
            </Screen>
        );
    }

    const tabs: Filter[] = ["All", "Active", "Completed"];

    return (
        <Screen className="gap-5">
            <View className="flex-row items-center gap-3">
                <BackButton />
                <Text className="font-jakarta-extrabold text-2xl tracking-tight">My Quests</Text>
            </View>

            <View className="flex-row gap-2">
                {tabs.map((tab) => (
                    <View key={tab} className="flex-1">
                        <View className={cn("border-foreground rounded-xl border-2 py-2.5", filter === tab ? "bg-amber shadow-nb" : "bg-card")}>
                            <Text onPress={() => setFilter(tab)} className={cn("font-jakarta-extrabold text-center text-xs", filter === tab ? "text-black" : "text-foreground")}>
                                {tab}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {quests.length === 0 ? (
                <EmptyState
                    icon={filter === "Completed" ? CheckCircle2 : Sparkles}
                    title={filter === "Completed" ? "No completed quests" : filter === "Active" ? "No active quests" : "No quests yet"}
                    description={filter === "All" ? "Create a quest to get started!" : `You have no ${filter.toLowerCase()} quests.`}
                    actionLabel={filter === "All" ? "Create Quest" : undefined}
                    onAction={filter === "All" ? () => router.push("/(app)/(home)/(quests)/create") : undefined}
                />
            ) : (
                quests.map((quest) => (
                    <QuestCard
                        key={quest.id}
                        quest={quest}
                        onPress={() => router.push({ pathname: "/(app)/(tabs)/(home)/(quests)/[id]", params: { id: quest.id, code: quest.party.code } })}
                        showComplete={quest.status === "Active" && (quest.questActivities?.length ?? 0) === 0}
                        onComplete={() => handleComplete(quest)}
                    />
                ))
            )}
        </Screen>
    );
}
