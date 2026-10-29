import { AlertCircle, Award, CheckCircle2, Edit3, Flame, Save, Users, Users2Icon, Zap } from "lucide-react-native";
import { useCompleteQuest, useGetQuest, useUpdateQuest } from "@/hooks/tan-stack/quest";
import { formatDateTime, relativeTime } from "@/utils/formatters";
import QuestStatusBadge from "@/components/quest-status-badge";
import DifficultyBadge from "@/components/difficulty-badge";
import { router, useLocalSearchParams } from "expo-router";
import { SkeletonCard } from "@/components/ui/skeleton";
import { Alert, Pressable, View } from "react-native";
import { useColor } from "@/hooks/custom/use-color";
import BackButton from "@/components/back-button";
import { useAuth } from "@/contexts/auth-context";
import { Difficulty, Mode } from "@/types/models";
import { Input } from "@/components/ui/input";
import { UpdateQuestDto } from "@/types/dto";
import Screen from "@/components/ui/screen";
import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import { useState } from "react";
import { cn } from "cn";

import { DIFFICULTIES, REWARD_MAP } from "./create";


const MODE_ICON = { Normal: Flame, Rush: Zap };

export default function QuestDetail() {
    const color = useColor();
    const { user } = useAuth();
    const { id, code } = useLocalSearchParams<{ id: string; code: string }>();
    const questQuery = useGetQuest(id!, code!);
    const completeQuestMutation = useCompleteQuest();
    const updateQuestMutation = useUpdateQuest();
    const [editing, setEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editDifficulty, setEditDifficulty] = useState<Difficulty>("Normal");
    const [editMode, setEditMode] = useState<Mode>("Normal");
    const [errors, setErrors] = useState<{ title?: string; description?: string; general?: string }>({});

    function handleComplete() {
        const quest = questQuery.data;
        if (!quest) return;
        Alert.alert("Complete Quest", `Mark "${quest.title}" as completed?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Complete",
                onPress: () => {
                    setErrors((prev) => ({ ...prev, general: undefined }));
                    completeQuestMutation.mutate({ id: quest.id, code: quest.party.code }, { onError: (err) => setErrors((prev) => ({ ...prev, general: err.message || "Failed to complete quest. Please try again." })) });
                },
            },
        ]);
    }

    function startEditing() {
        const quest = questQuery.data;
        if (!quest) return;
        setEditTitle(quest.title);
        setEditDescription(quest.description);
        setEditDifficulty(quest.difficulty);
        setEditMode(quest.mode);
        setErrors({});
        setEditing(true);
    }

    function cancelEditing() {
        setEditing(false);
        setErrors({});
    }

    function handleSave() {
        const quest = questQuery.data;
        if (!quest) return;

        const newErrors: { title?: string; description?: string } = {};
        if (!editTitle.trim()) newErrors.title = "Quest title is required.";
        if (!editDescription.trim()) newErrors.description = "Quest description is required.";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        const dto: UpdateQuestDto = {
            title: editTitle.trim(),
            description: editDescription.trim(),
            difficulty: editDifficulty,
            mode: editMode,
        };
        updateQuestMutation.mutate(
            { id: quest.id, data: dto },
            {
                onSuccess: () => {
                    setEditing(false);
                    setErrors({});
                },
                onError: (err) => setErrors((prev) => ({ ...prev, general: err.message || "Failed to update quest. Please try again." })),
            },
        );
    }

    if (questQuery.isFetching) {
        return (
            <Screen className="gap-5">
                <SkeletonCard lines={4} />
                <SkeletonCard lines={3} />
            </Screen>
        );
    }

    if (questQuery.error || !questQuery.data) {
        return (
            <Screen fullscreen className="items-center justify-center">
                <Text className="text-destructive text-sm">{questQuery.error?.message || "Quest not found"}</Text>
            </Screen>
        );
    }

    const quest = questQuery.data;
    const questActivities = quest.questActivities ?? [];
    const ModeIcon = MODE_ICON[quest.mode];
    const isCreator = user?.id === quest.creatorId;
    const isActive = quest.status === "Active";
    const hasCompleted = questActivities.some((activity) => activity.user.id === user?.id);

    return (
        <Screen className="gap-5">
            <BackButton label={editing ? "Edit Quest" : "Quest Details"} />

            {errors.general && (
                <View className="border-foreground shadow-nb flex-row items-center gap-2.5 border-2 bg-red-100 p-3.5">
                    <AlertCircle size={18} color="#DC2626" strokeWidth={2.5} />
                    <Text className="font-jakarta-bold flex-1 text-xs text-red-700">{errors.general}</Text>
                </View>
            )}

            {editing ? (
                <>
                    <View className="gap-1.5">
                        <Text className="text-sm font-bold">Title</Text>
                        <Input
                            placeholder="Quest title"
                            value={editTitle}
                            onChangeText={(val) => {
                                setEditTitle(val);
                                setErrors((prev) => ({ ...prev, general: undefined, title: val.trim() ? undefined : prev.title }));
                            }}
                        />
                        <FieldError message={errors.title} />
                    </View>

                    <View className="gap-1.5">
                        <Text className="text-sm font-bold">Description</Text>
                        <Input
                            placeholder="Describe the quest..."
                            value={editDescription}
                            onChangeText={(val) => {
                                setEditDescription(val);
                                setErrors((prev) => ({ ...prev, general: undefined, description: val.trim() ? undefined : prev.description }));
                            }}
                            multiline
                            numberOfLines={3}
                            className="h-24 pt-3"
                            textAlignVertical="top"
                        />
                        <FieldError message={errors.description} />
                    </View>

                    <View className="gap-1.5">
                        <Text className="text-sm font-bold">Mode</Text>
                        <View className="flex-row gap-2">
                            {(["Normal", "Rush"] as Mode[]).map((m) => (
                                <View key={m} className="flex-1">
                                    <Pressable onPress={() => setEditMode(m)} className={cn("border-foreground border-2 py-3", editMode === m ? "bg-amber shadow-nb" : "bg-card")}>
                                        <Text className={cn("text-center text-xs font-extrabold uppercase", editMode === m && "text-black")}>{m}</Text>
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View className="gap-1.5">
                        <Text className="text-sm font-bold">Difficulty</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {DIFFICULTIES.map((d) => {
                                const selected = editDifficulty === d;
                                return (
                                    <Pressable key={d} onPress={() => setEditDifficulty(d)} className={cn("w-[31.5%] items-center gap-2 border-2 px-2 py-3", selected ? "border-foreground bg-amber shadow-nb" : "border-border bg-card")}>
                                        <DifficultyBadge difficulty={d} size="icon" />
                                        <Text className={cn("text-xs font-extrabold", selected ? "text-black" : "text-foreground")}>{d}</Text>
                                        <Text className={cn("text-xl font-extrabold", selected ? "text-black/80" : "text-muted-foreground")}>{REWARD_MAP[d]} XP</Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <Button variant="outline" onPress={cancelEditing}>
                                <Text className="text-sm font-bold">Cancel</Text>
                            </Button>
                        </View>
                        <View className="flex-1">
                            <Button onPress={handleSave} disabled={updateQuestMutation.isPending}>
                                <Save size={16} color="#000" strokeWidth={2.5} />
                                <Text className="text-sm font-bold">{updateQuestMutation.isPending ? "Saving..." : "Save"}</Text>
                            </Button>
                        </View>
                    </View>
                </>
            ) : (
                <>
                    <View className="shadow-nb border-foreground gap-4 border-2 p-4">
                        <View className="flex-row items-start justify-between gap-2">
                            <View className="flex-1 gap-1">
                                <Text className="text-lg font-extrabold">{quest.title}</Text>
                                <Text className="text-muted-foreground text-xs font-bold">By {quest.creator.name}</Text>
                            </View>
                            <DifficultyBadge difficulty={quest.difficulty} size="lg" />
                        </View>

                        <Text className="text-muted-foreground text-sm font-bold">{quest.description}</Text>

                        <View className="flex-row flex-wrap gap-2">
                            <QuestStatusBadge status={quest.status} />
                            <View className="border-foreground bg-card flex-row items-center gap-1 rounded-full border px-2.5 py-0.5">
                                <ModeIcon size={12} color={color.foreground} strokeWidth={2.5} />
                                <Text className="text-xs font-bold">{quest.mode}</Text>
                            </View>
                        </View>
                    </View>

                    <View className="shadow-nb border-foreground gap-3 border-2 p-4">
                        <View className="flex-row items-center gap-2">
                            <Users size={18} color={color.foreground} strokeWidth={2.5} />
                            <Text className="text-sm font-extrabold">Details</Text>
                        </View>

                        <View className="gap-2.5">
                            <View className="flex-row items-center justify-between">
                                <Text className="text-muted-foreground text-xs font-bold">Party</Text>
                                <Text className="text-xs font-extrabold">{quest.party.name}</Text>
                            </View>
                            <View className="flex-row items-center justify-between">
                                <Text className="text-muted-foreground text-xs font-bold">Code</Text>
                                <Text className="text-xs font-extrabold">{quest.party.code}</Text>
                            </View>
                            <View className="flex-row items-center justify-between">
                                <Text className="text-muted-foreground text-xs font-bold">Completed</Text>
                                <Text className="text-xs font-extrabold">
                                    {quest._count.questActivities} {quest._count.questActivities === 1 ? "member" : "members"}
                                </Text>
                            </View>
                            <View className="flex-row items-center justify-between">
                                <Text className="text-muted-foreground text-xs font-bold">Created</Text>
                                <Text className="text-xs font-bold">{formatDateTime(quest.createdAt)}</Text>
                            </View>
                            {quest.completedAt && (
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-muted-foreground text-xs font-bold">Finished</Text>
                                    <Text className="text-xs font-bold">{formatDateTime(quest.completedAt)}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View className="shadow-nb border-foreground gap-3 border-2 p-4">
                        <View className="flex-row items-center gap-2">
                            <CheckCircle2 size={18} color={color.foreground} strokeWidth={2.5} />
                            <Text className="text-sm font-extrabold">Completions</Text>
                        </View>

                        {questActivities.length === 0 ? (
                            <Text className="text-muted-foreground text-xs font-bold">No one has completed this quest yet.</Text>
                        ) : (
                            <View className="gap-2.5">
                                {questActivities.map((activity) => (
                                    <View key={activity.id} className="flex-row items-center justify-between">
                                        <Text className="text-xs font-extrabold">{activity.user.name}</Text>
                                        <Text className="text-muted-foreground text-[11px] font-bold">{relativeTime(activity.completedAt)}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    <View className="border-foreground bg-lime shadow-nb flex-row items-center gap-2 border-2 p-3.5">
                        <Award size={20} color="#000" strokeWidth={2.5} />
                        <Text className="text-sm font-extrabold text-black">+{quest.reward} XP</Text>
                    </View>

                    {isActive && (
                        <Button variant="success" onPress={handleComplete} disabled={completeQuestMutation.isPending || hasCompleted} asChild>
                            <CheckCircle2 size={18} color="#000" strokeWidth={2.5} />
                            <Text className="font-extrabold text-black">{hasCompleted ? "Quest Completed" : completeQuestMutation.isPending ? "Completing..." : "Complete Quest"}</Text>
                        </Button>
                    )}

                    {isCreator && isActive && (
                        <Button variant="outline" onPress={startEditing} asChild>
                            <Edit3 size={16} color="#000" strokeWidth={2.5} />
                            <Text className="text-sm font-bold">Edit Quest</Text>
                        </Button>
                    )}

                    <Button onPress={() => router.back()} asChild>
                        <Users2Icon size={18} color="#000" strokeWidth={2.5} />
                        <Text className="font-extrabold text-black">Go To Party</Text>
                    </Button>
                </>
            )}
        </Screen>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;

    return <Text className="mt-0.5 text-sm font-bold text-red-600">{message}</Text>;
}
