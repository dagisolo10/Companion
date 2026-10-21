import { cn } from "@/lib/utils";
import { useState } from "react";
import Text from "@/components/ui/text";
import Button from "@/components/ui/button";
import Screen from "@/components/ui/screen";
import { Pressable, View } from "react-native";
import QuestCard from "@/components/quest-card";
import BackButton from "@/components/back-button";
import EmptyState from "@/components/ui/empty-state";
import { Plus, ScrollText } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useGetPartyQuests } from "@/hooks/tan-stack/quest";
import { SkeletonQuestList } from "@/components/ui/skeleton";

type Filter = "All" | "Active" | "Completed";

const FILTERS: Filter[] = ["All", "Active", "Completed"];

export default function PartyQuestsScreen() {
    const { code } = useLocalSearchParams<{ code: string }>();
    const [filter, setFilter] = useState<Filter>("All");

    const { data: quests = [], isFetching } = useGetPartyQuests(code!);

    if (isFetching) {
        return (
            <Screen className="gap-5">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                        <BackButton />
                        <Text className="font-jakarta-extrabold text-2xl tracking-tight">Quests</Text>
                    </View>
                </View>
                <SkeletonQuestList count={4} />
            </Screen>
        );
    }

    const filtered = quests.filter((q) => {
        if (filter === "Active") return q.status === "Active";
        if (filter === "Completed") return q.status === "Completed";
        return true;
    });

    const activeCount = quests.filter((q) => q.status === "Active").length;
    const completedCount = quests.filter((q) => q.status === "Completed").length;

    return (
        <Screen className="gap-5">
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                    <BackButton />
                    <Text className="font-jakarta-extrabold text-2xl tracking-tight">Quests</Text>
                </View>
                <Button size="sm" asChild onPress={() => router.push({ pathname: "/(app)/(tabs)/(home)/(quests)/create", params: { partyCode: code } })}>
                    <Plus size={14} color="#000000" strokeWidth={2.5} />
                    <Text className="font-jakarta-bold text-xs">Create</Text>
                </Button>
            </View>

            <View>
                <View className="flex-row gap-2">
                    {FILTERS.map((f) => {
                        const isActive = filter === f;
                        const count = f === "Active" ? activeCount : f === "Completed" ? completedCount : quests.length;
                        return (
                            <Pressable key={f} onPress={() => setFilter(f)} className={cn("flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border-2 px-3 py-2.5", isActive ? "border-foreground bg-card shadow-nb-sm" : "border-border bg-transparent")}>
                                <Text className={cn("font-jakarta-bold text-xs", isActive ? "text-foreground" : "text-muted-foreground")}>{f}</Text>
                                <View className={cn("rounded-full px-1.5 py-0.5", isActive ? "bg-foreground" : "bg-muted")}>
                                    <Text className={cn("font-jakarta-extrabold text-[10px]", isActive ? "text-background" : "text-muted-foreground")}>{count}</Text>
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            <View className="gap-3">
                {filtered.length === 0 ? (
                    <EmptyState icon={ScrollText} title={`No ${filter.toLowerCase()} quests`} description="Create a quest to get started." actionLabel="Create Quest" onAction={() => router.push({ pathname: "/(app)/(tabs)/(home)/(quests)/create", params: { partyCode: code } })} />
                ) : (
                    filtered.map((quest, index) => (
                        <View key={quest.id}>
                            <QuestCard quest={quest} onPress={() => router.push({ pathname: "/(app)/(tabs)/(home)/(quests)/[id]", params: { id: quest.id, code } })} />
                        </View>
                    ))
                )}
            </View>
        </Screen>
    );
}
