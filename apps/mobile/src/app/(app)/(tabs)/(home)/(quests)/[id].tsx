import BackButton from "@/components/back-button";
import DifficultyBadge from "@/components/difficulty-badge";
import QuestStatusBadge from "@/components/quest-status-badge";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import { SkeletonCard } from "@/components/ui/skeleton";
import Text from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useColor } from "@/hooks/custom/use-color";
import { useCompleteQuest, useGetQuest, useUpdateQuest } from "@/hooks/tan-stack/quest";
import { cn } from "@/lib/utils";
import { UpdateQuestDto } from "@/types/dto";
import { Difficulty, Mode } from "@/types/models";
import { formatDateTime, relativeTime } from "@/utils/formatters";
import { useLocalSearchParams } from "expo-router";
import { Award, CheckCircle2, Edit3, Flame, Save, Users, Zap } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, View } from "react-native";

import { DIFFICULTIES, REWARD_MAP } from "./create";

const MODE_ICON = { Normal: Flame, Race: Zap };

export default function QuestDetail() {
    const { id, code } = useLocalSearchParams<{ id: string; code: string }>();
    const { user } = useAuth();
    const color = useColor();
    const { data: quest, isFetching, error } = useGetQuest(id!, code!);
    const { mutate: completeQuest, isPending } = useCompleteQuest();
    const { mutate: updateQuest, isPending: updating } = useUpdateQuest();
    const [editing, setEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editDifficulty, setEditDifficulty] = useState<Difficulty>("Normal");
    const [editMode, setEditMode] = useState<Mode>("Normal");

    function handleComplete() {
        if (!quest) return;
        Alert.alert("Complete Quest", `Mark "${quest.title}" as completed?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Complete",
                onPress: () => completeQuest({ id: quest.id, code: quest.party.code }, { onError: (err) => Alert.alert("Error", err.message) }),
            },
        ]);
    }

    function startEditing() {
        if (!quest) return;
        setEditTitle(quest.title);
        setEditDescription(quest.description);
        setEditDifficulty(quest.difficulty);
        setEditMode(quest.mode);
        setEditing(true);
    }

    function handleSave() {
        if (!editTitle.trim() || !editDescription.trim()) {
            Alert.alert("Missing fields", "Title and description are required.");
            return;
        }
        const dto: UpdateQuestDto = {
            title: editTitle.trim(),
            description: editDescription.trim(),
            difficulty: editDifficulty,
            mode: editMode,
        };
        updateQuest(
            { id: quest!.id, data: dto },
            {
                onSuccess: () => setEditing(false),
                onError: (err) => Alert.alert("Error", err.message),
            },
        );
    }

    if (isFetching) {
        return (
            <Screen className="gap-5">
                <View className="flex-row items-center gap-3">
                    <BackButton />
                    <Text className="font-jakarta-extrabold text-2xl tracking-tight">Quest Detail</Text>
                </View>
                <SkeletonCard lines={4} />
                <SkeletonCard lines={3} />
            </Screen>
        );
    }

    if (error || !quest) {
        return (
            <Screen fullscreen className="items-center justify-center">
                <Text className="text-destructive text-sm">{error?.message || "Quest not found"}</Text>
            </Screen>
        );
    }

    const ModeIcon = MODE_ICON[quest.mode];
    const isCreator = user?.id === quest.creatorId;
    const isActive = quest.status === "Active";
    const hasCompleted = quest.questActivities.some((activity) => activity.user.id === user?.id);

    return (
        <Screen className="gap-5">
            <View className="flex-row items-center gap-3">
                <BackButton />
                <Text className="font-jakarta-extrabold text-2xl tracking-tight">Quest Detail</Text>
            </View>

            {editing ? (
                <>
                    <View className="gap-1.5">
                        <Text className="font-jakarta-bold text-sm">Title</Text>
                        <Input placeholder="Quest title" value={editTitle} onChangeText={setEditTitle} />
                    </View>

                    <View className="gap-1.5">
                        <Text className="font-jakarta-bold text-sm">Description</Text>
                        <Input placeholder="Describe the quest..." value={editDescription} onChangeText={setEditDescription} multiline numberOfLines={3} className="h-24 pt-3" textAlignVertical="top" />
                    </View>

                    <View className="gap-1.5">
                        <Text className="font-jakarta-bold text-sm">Mode</Text>
                        <View className="flex-row gap-2">
                            {(["Normal", "Race"] as Mode[]).map((m) => (
                                <View key={m} className="flex-1">
                                    <Pressable onPress={() => setEditMode(m)} className={cn("border-foreground rounded-xl border-2 py-3", editMode === m ? "bg-amber shadow-nb" : "bg-card")}>
                                        <Text className={cn("font-jakarta-extrabold text-center text-xs uppercase", editMode === m && "text-black")}>{m}</Text>
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View className="gap-1.5">
                        <Text className="font-jakarta-bold text-sm">Difficulty</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {DIFFICULTIES.map((d) => {
                                const selected = editDifficulty === d;
                                return (
                                    <Pressable key={d} onPress={() => setEditDifficulty(d)} className={cn("w-[31.5%] items-center gap-2 rounded-2xl border-2 px-2 py-3", selected ? "border-foreground bg-amber shadow-nb" : "border-border bg-card")}>
                                        <DifficultyBadge difficulty={d} size="icon" />
                                        <Text className={cn("font-jakarta-extrabold text-xs", selected ? "text-black" : "text-foreground")}>{d}</Text>
                                        <Text className={cn("font-jakarta-extrabold text-xl", selected ? "text-black/80" : "text-muted-foreground")}>{REWARD_MAP[d]} XP</Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <Button variant="outline" onPress={() => setEditing(false)}>
                                <Text className="font-jakarta-bold text-sm">Cancel</Text>
                            </Button>
                        </View>
                        <View className="flex-1">
                            <Button onPress={handleSave} disabled={updating}>
                                <Save size={16} color="#000" strokeWidth={2.5} />
                                <Text className="font-jakarta-bold text-sm">{updating ? "Saving..." : "Save"}</Text>
                            </Button>
                        </View>
                    </View>
                </>
            ) : (
                <>
                    <View className="shadow-nb border-foreground gap-4 rounded-2xl border-2 p-4">
                        <View className="flex-row items-start justify-between gap-2">
                            <View className="flex-1 gap-1">
                                <Text className="font-jakarta-extrabold text-lg">{quest.title}</Text>
                                <Text className="text-muted-foreground font-jakarta-bold text-xs">By {quest.creator.name}</Text>
                            </View>
                            <DifficultyBadge difficulty={quest.difficulty} size="lg" />
                        </View>

                        <Text className="text-muted-foreground font-jakarta-bold text-sm">{quest.description}</Text>

                        <View className="flex-row flex-wrap gap-2">
                            <QuestStatusBadge status={quest.status} />
                            <View className="border-foreground bg-card flex-row items-center gap-1 rounded-full border px-2.5 py-0.5">
                                <ModeIcon size={12} color={color.foreground} strokeWidth={2.5} />
                                <Text className="font-jakarta-bold text-xs">{quest.mode}</Text>
                            </View>
                        </View>
                    </View>

                    <View className="shadow-nb border-foreground gap-3 rounded-2xl border-2 p-4">
                        <View className="flex-row items-center gap-2">
                            <Users size={18} color={color.foreground} strokeWidth={2.5} />
                            <Text className="font-jakarta-extrabold text-sm">Details</Text>
                        </View>

                        <View className="gap-2.5">
                            <View className="flex-row items-center justify-between">
                                <Text className="text-muted-foreground font-jakarta-bold text-xs">Party</Text>
                                <Text className="font-jakarta-extrabold text-xs">{quest.party.code}</Text>
                            </View>
                            <View className="flex-row items-center justify-between">
                                <Text className="text-muted-foreground font-jakarta-bold text-xs">Completed</Text>
                                <Text className="font-jakarta-extrabold text-xs">
                                    {quest._count.questActivities} {quest._count.questActivities === 1 ? "member" : "members"}
                                </Text>
                            </View>
                            <View className="flex-row items-center justify-between">
                                <Text className="text-muted-foreground font-jakarta-bold text-xs">Created</Text>
                                <Text className="font-jakarta-bold text-xs">{formatDateTime(quest.createdAt)}</Text>
                            </View>
                            {quest.completedAt && (
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-muted-foreground font-jakarta-bold text-xs">Finished</Text>
                                    <Text className="font-jakarta-bold text-xs">{formatDateTime(quest.completedAt)}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View className="shadow-nb border-foreground gap-3 rounded-2xl border-2 p-4">
                        <View className="flex-row items-center gap-2">
                            <CheckCircle2 size={18} color={color.foreground} strokeWidth={2.5} />
                            <Text className="font-jakarta-extrabold text-sm">Completions</Text>
                        </View>

                        {quest.questActivities.length === 0 ? (
                            <Text className="text-muted-foreground font-jakarta-bold text-xs">No one has completed this quest yet.</Text>
                        ) : (
                            <View className="gap-2.5">
                                {quest.questActivities.map((activity) => (
                                    <View key={activity.id} className="flex-row items-center justify-between">
                                        <Text className="font-jakarta-extrabold text-xs">{activity.user.name}</Text>
                                        <Text className="text-muted-foreground font-jakarta-bold text-[11px]">{relativeTime(activity.completedAt)}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    <View className="border-foreground bg-lime shadow-nb flex-row items-center gap-2 rounded-2xl border-2 p-3.5">
                        <Award size={20} color="#000" strokeWidth={2.5} />
                        <Text className="font-jakarta-extrabold text-sm text-black">+{quest.reward} XP</Text>
                    </View>

                    {isActive && (
                        <Button variant="success" onPress={handleComplete} disabled={isPending || hasCompleted} asChild>
                            <CheckCircle2 size={18} color="#000" strokeWidth={2.5} />
                            <Text className="font-jakarta-extrabold text-black">{hasCompleted ? "Quest Completed" : isPending ? "Completing..." : "Complete Quest"}</Text>
                        </Button>
                    )}

                    {isCreator && isActive && (
                        <Button variant="outline" onPress={startEditing} asChild>
                            <Edit3 size={16} color="#000" strokeWidth={2.5} />
                            <Text className="font-jakarta-bold text-sm">Edit Quest</Text>
                        </Button>
                    )}
                </>
            )}
        </Screen>
    );
}
