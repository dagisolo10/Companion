import BackButton from "@/components/common/back-button";
import SectionHeader from "@/components/common/section-header";
import PartySelector from "@/components/party/party-selector";
import DifficultyBadge from "@/components/quest/difficulty-badge";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import Text from "@/components/ui/text";
import { useGetMyParties } from "@/hooks/tan-stack/party";
import { useCreateQuest } from "@/hooks/tan-stack/quest";
import { CreateQuestDto } from "@/types/dto";
import { Difficulty, Mode } from "@companion/shared-types";
import { cn } from "cn";
import { router, useLocalSearchParams } from "expo-router";
import { AlertCircle, Award, PlusCircle } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

export const DIFFICULTIES: Difficulty[] = ["Tiny", "Easy", "Normal", "Hard", "Major"];
export const REWARD_MAP: Record<Difficulty, number> = { Tiny: 5, Easy: 10, Normal: 25, Hard: 50, Major: 100 };

export default function CreateQuest() {
    const { code: preselectedCode, partyCode } = useLocalSearchParams<{ code?: string; partyCode?: string }>();
    const partiesQuery = useGetMyParties();
    const [selectedPartyCode, setSelectedPartyCode] = useState(partyCode || preselectedCode || "");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [mode, setMode] = useState<Mode>("Normal");
    const [difficulty, setDifficulty] = useState<Difficulty>("Normal");
    const [expirationHours, setExpirationHours] = useState<number | null>(null);
    const [showPartyPicker, setShowPartyPicker] = useState(false);

    const [errors, setErrors] = useState<{ party?: string; title?: string; description?: string; general?: string }>({});

    const createQuestMutation = useCreateQuest();
    const selectedParty = partiesQuery.data?.find((p) => p.code === selectedPartyCode);

    function handleSubmit() {
        const newErrors: { party?: string; title?: string; description?: string } = {};

        if (!selectedPartyCode) newErrors.party = "Please select a party for this quest.";
        if (!title.trim()) newErrors.title = "Quest title is required.";
        if (!description.trim()) newErrors.description = "Quest description is required.";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        const dto: CreateQuestDto = {
            code: selectedPartyCode,
            title: title.trim(),
            description: description.trim(),
            mode,
            difficulty,
            ...(expirationHours !== null && { expirationHours }),
        };

        createQuestMutation.mutate(dto, {
            onSuccess: (quest) => router.push({ pathname: "/(app)/(tabs)/(party)/[code]", params: { code: quest.party.code } }),
            onError: (err) => setErrors({ general: err.message || "Failed to create quest. Please try again." }),
        });
    }

    return (
        <Screen className="gap-5">
            <BackButton label="Create Quest" />

            {errors.general && (
                <View className="border-foreground shadow-nb flex-row items-center gap-2.5 border-2 bg-red-100 p-3.5">
                    <AlertCircle size={18} color="#DC2626" strokeWidth={2.5} />
                    <Text className="font-jakarta-jakarta-bold flex-1 text-xs text-red-700">{errors.general}</Text>
                </View>
            )}

            <View className="gap-1">
                <PartySelector
                    parties={partiesQuery.data}
                    selectedParty={selectedParty}
                    showPartyPicker={showPartyPicker}
                    selectedPartyCode={selectedPartyCode}
                    onPick={() => setShowPartyPicker((c) => !c)}
                    loading={partiesQuery.isFetching || partiesQuery.isPending}
                    onPartySelect={(code) => {
                        setShowPartyPicker(false);
                        setSelectedPartyCode(code);
                        setErrors((prev) => ({ ...prev, party: undefined }));
                    }}
                />
                <FieldError message={errors.party} />
            </View>

            <View className="gap-1">
                <SectionHeader title="Title" />
                <Input
                    placeholder="Quest title"
                    value={title}
                    onChangeText={(val) => {
                        setTitle(val);
                        if (val.trim()) setErrors((prev) => ({ ...prev, title: undefined }));
                        else setErrors((prev) => ({ ...prev, title: "Quest title is required." }));
                    }}
                />
                <FieldError message={errors.title} />
            </View>

            <View className="gap-1">
                <SectionHeader title="Description" />
                <Input
                    placeholder="Describe the quest..."
                    value={description}
                    onChangeText={(val) => {
                        setDescription(val);
                        if (val.trim()) setErrors((prev) => ({ ...prev, description: undefined }));
                        else setErrors((prev) => ({ ...prev, description: "Quest description is required." }));
                    }}
                    multiline
                    numberOfLines={3}
                    className="h-24 pt-3"
                    textAlignVertical="top"
                />
                <FieldError message={errors.description} />
            </View>

            <View className="gap-1.5">
                <SectionHeader title="Mode" />
                <View className="flex-row gap-2">
                    {(["Normal", "Rush"] as Mode[]).map((m) => (
                        <View key={m} className="flex-1">
                            <Pressable onPress={() => setMode(m)} className={cn("border-foreground border-2 py-3", mode === m ? "bg-amber shadow-nb" : "bg-card")}>
                                <Text className={cn("font-jakarta-extrabold text-center text-xs uppercase", mode === m && "text-black")}>{m}</Text>
                            </Pressable>
                        </View>
                    ))}
                </View>
            </View>

            <View className="gap-1.5">
                <SectionHeader title="Difficulty" />
                <View className="flex-row flex-wrap gap-2">
                    {DIFFICULTIES.map((d) => {
                        const selected = difficulty === d;
                        return (
                            <Pressable key={d} onPress={() => setDifficulty(d)} className={cn("w-[31.5%] items-center gap-2 border-2 px-2 py-3", selected ? "border-foreground bg-amber shadow-nb" : "border-border bg-card")}>
                                <DifficultyBadge difficulty={d} size="icon" />
                                <Text className={cn("font-jakarta-extrabold text-xs", selected ? "text-black" : "text-foreground")}>{d}</Text>
                                <Text className={cn("font-jakarta-extrabold text-lg", selected ? "text-black/80" : "text-muted-foreground")}>{REWARD_MAP[d]} XP</Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            <View className="gap-1.5">
                <SectionHeader title="Expiration" />
                <Text className="text-muted-foreground text-xs">The 15-minute cooldown starts first. The timer begins when the quest becomes active.</Text>
                <View className="flex-row flex-wrap gap-2">
                    {(
                        [
                            { label: "No expiration", hours: null },
                            { label: "12 hours", hours: 12 },
                            { label: "1 day", hours: 24 },
                            { label: "3 days", hours: 72 },
                            { label: "7 days", hours: 168 },
                        ] as const
                    ).map((option) => (
                        <Pressable key={option.label} onPress={() => setExpirationHours(option.hours)} className={cn("border-foreground min-w-48 border-2 px-3 py-2", expirationHours === option.hours ? "bg-amber shadow-nb" : "bg-card")}>
                            <Text className={cn("font-jakarta-bold text-xs", expirationHours === option.hours && "text-black")}>{option.label}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            <View className="border-foreground bg-lime shadow-nb flex-row items-center gap-2 border-2 p-3.5">
                <Award size={20} color="#000" strokeWidth={2.5} />
                <Text className="font-jakarta-extrabold text-sm text-black">Reward: {REWARD_MAP[difficulty]} XP</Text>
            </View>

            <Button onPress={handleSubmit} disabled={createQuestMutation.isPending} size={"lg"} className="mt-2" right={PlusCircle}>
                <Text className="text-center">{createQuestMutation.isPending ? "Creating..." : "Create Quest"}</Text>
            </Button>
        </Screen>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;

    return <Text className="font-jakarta-bold mt-0.5 text-sm text-red-600">{message}</Text>;
}
