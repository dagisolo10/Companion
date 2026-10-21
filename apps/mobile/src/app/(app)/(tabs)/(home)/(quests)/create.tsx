import BackButton from "@/components/back-button";
import DifficultyBadge from "@/components/difficulty-badge";
import PartySelector from "@/components/party/party-selector";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import { SkeletonCard } from "@/components/ui/skeleton";
import Text from "@/components/ui/text";
import { useGetMyParties } from "@/hooks/tan-stack/party";
import { useCreateQuest } from "@/hooks/tan-stack/quest";
import { cn } from "@/lib/utils";
import { CreateQuestDto } from "@/types/dto";
import { Difficulty, Mode } from "@/types/models";
import { router, useLocalSearchParams } from "expo-router";
import { Award } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, View } from "react-native";

export const DIFFICULTIES: Difficulty[] = ["Tiny", "Easy", "Normal", "Hard", "Major"];
export const REWARD_MAP: Record<Difficulty, number> = { Tiny: 5, Easy: 10, Normal: 25, Hard: 50, Major: 100 };

export default function CreateQuest() {
    const { partyCode: preselectedCode } = useLocalSearchParams<{ partyCode?: string }>();
    const { data: parties = [], isFetching: fetchingParties } = useGetMyParties();
    const [selectedPartyCode, setSelectedPartyCode] = useState(preselectedCode || "");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [mode, setMode] = useState<Mode>("Normal");
    const [difficulty, setDifficulty] = useState<Difficulty>("Normal");
    const [showPartyPicker, setShowPartyPicker] = useState(false);
    const { mutate: createQuest, isPending } = useCreateQuest();

    const selectedParty = parties.find((p) => p.code === selectedPartyCode);

    function handleSubmit() {
        if (!selectedPartyCode || !title.trim() || !description.trim()) {
            Alert.alert("Missing fields", "Please fill in all fields.");
            return;
        }
        const dto: CreateQuestDto = {
            partyId: selectedPartyCode,
            title: title.trim(),
            description: description.trim(),
            mode,
            difficulty,
        };
        createQuest(dto, {
            onSuccess: () => router.back(),
            onError: (err) => Alert.alert("Error", err.message),
        });
    }

    if (fetchingParties) {
        return (
            <Screen className="gap-5">
                <View className="flex-row items-center gap-3">
                    <BackButton />
                    <Text className="font-jakarta-extrabold text-2xl tracking-tight">Create Quest</Text>
                </View>
                <SkeletonCard lines={5} />
            </Screen>
        );
    }

    return (
        <Screen className="gap-5">
            <View className="flex-row items-center gap-3">
                <BackButton />
                <Text className="font-jakarta-extrabold text-2xl tracking-tight">Create Quest</Text>
            </View>

            <PartySelector
                parties={parties}
                selectedParty={selectedParty}
                showPartyPicker={showPartyPicker}
                selectedPartyCode={selectedPartyCode}
                onPick={() => setShowPartyPicker((c) => !c)}
                onPartySelect={(code) => {
                    setShowPartyPicker(false);
                    setSelectedPartyCode(code);
                }}
            />

            <View className="gap-1.5">
                <Text className="font-jakarta-bold text-sm">Title</Text>
                <Input placeholder="Quest title" value={title} onChangeText={setTitle} />
            </View>

            <View className="gap-1.5">
                <Text className="font-jakarta-bold text-sm">Description</Text>
                <Input placeholder="Describe the quest..." value={description} onChangeText={setDescription} multiline numberOfLines={3} className="h-24 pt-3" textAlignVertical="top" />
            </View>

            <View className="gap-1.5">
                <Text className="font-jakarta-bold text-sm">Mode</Text>
                <View className="flex-row gap-2">
                    {(["Normal", "Race"] as Mode[]).map((m) => (
                        <View key={m} className="flex-1">
                            <Pressable onPress={() => setMode(m)} className={cn("border-foreground rounded-xl border-2 py-3", mode === m ? "bg-amber shadow-nb" : "bg-card")}>
                                <Text className={cn("font-jakarta-extrabold text-center text-xs uppercase", mode === m && "text-black")}>{m}</Text>
                            </Pressable>
                        </View>
                    ))}
                </View>
            </View>

            <View className="gap-1.5">
                <Text className="font-jakarta-bold text-sm">Difficulty</Text>
                <View className="flex-row flex-wrap gap-2">
                    {DIFFICULTIES.map((d) => {
                        const selected = difficulty === d;
                        return (
                            <Pressable key={d} onPress={() => setDifficulty(d)} className={cn("w-[31.5%] items-center gap-2 rounded-2xl border-2 px-2 py-3", selected ? "border-foreground bg-amber shadow-nb" : "border-border bg-card")}>
                                <DifficultyBadge difficulty={d} size="icon" />
                                <Text className={cn("font-jakarta-extrabold text-xs", selected ? "text-black" : "text-foreground")}>{d}</Text>
                                <Text className={cn("font-jakarta-extrabold text-lg", selected ? "text-black/80" : "text-muted-foreground")}>{REWARD_MAP[d]} XP</Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            <View className="border-foreground bg-lime shadow-nb flex-row items-center gap-2 rounded-2xl border-2 p-3.5">
                <Award size={20} color="#000" strokeWidth={2.5} />
                <Text className="font-jakarta-extrabold text-sm text-black">Reward: {REWARD_MAP[difficulty]} XP</Text>
            </View>

            <Button onPress={handleSubmit} disabled={isPending} size={"lg"} className="mt-2">
                {isPending ? "Creating..." : "Create Quest"}
            </Button>
        </Screen>
    );
}
