import Animated, { createAnimatedComponent, Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Check, ChevronDown, Users } from "lucide-react-native";
import { SkeletonBlock } from "@/components/ui/skeleton";
import SectionHeader from "@/components/section-header";
import { Pressable, View } from "react-native";
import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import { Party } from "@/types/models";
import { router } from "expo-router";
import { useEffect } from "react";
import { cn } from "cn";


type PartySelectorProps = {
    parties: Party[];
    loading: boolean;
    onPick: () => void;
    showPartyPicker: boolean;
    selectedParty: Party | undefined;
    onPartySelect: (code: string) => void;
    selectedPartyCode: string | undefined;
};

const AnimatedChevron = createAnimatedComponent(ChevronDown);

export default function PartySelector({ parties, showPartyPicker, selectedPartyCode, selectedParty, loading, onPick, onPartySelect }: PartySelectorProps) {
    const rotation = useSharedValue(0);
    const progress = useSharedValue(0);
    const menuHeight = useSharedValue(0);

    useEffect(() => {
        rotation.value = withTiming(showPartyPicker ? 180 : 0, { duration: 250, easing: Easing.bezier(0.25, 1, 0.5, 1) });
        progress.value = withTiming(showPartyPicker ? 1 : 0, { duration: 250, easing: Easing.bezier(0.25, 1, 0.5, 1) });
    }, [progress, rotation, showPartyPicker]);

    const chevronStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
    const dynamicDropdownStyle = useAnimatedStyle(() => ({ opacity: progress.value, height: progress.value * menuHeight.value }));

    if (!loading && parties.length === 0) {
        return (
            <View className="gap-2">
                <SectionHeader title="Party" />

                <View className="card items-center gap-3 py-6">
                    <View className="border-foreground bg-amber border-2 p-2">
                        <Users size={18} color="#000" strokeWidth={2.5} />
                    </View>
                    <View className="items-center gap-0.5">
                        <Text className="text-sm font-bold">No parties yet</Text>
                        <Text className="text-muted-foreground text-xs font-bold">Create a party to pick one here.</Text>
                    </View>
                    <Button size="sm" onPress={() => router.push("/(app)/(tabs)/(party)/create")}>
                        <Text>Create Party</Text>
                    </Button>
                </View>
            </View>
        );
    }

    return (
        <View className="z-20 gap-2">
            <SectionHeader title="Party" />

            <Pressable onPress={onPick} className="card flex-row items-center justify-between px-4 py-3.5 active:opacity-90">
                <Text className={cn("text-sm font-bold", !selectedPartyCode && "text-muted-foreground")}>{selectedParty ? selectedParty.name : "Select a party"}</Text>
                <AnimatedChevron size={18} color="#000" strokeWidth={2.5} style={chevronStyle} />
            </Pressable>

            <Animated.View style={[dynamicDropdownStyle]} className="overflow-hidden">
                <View onLayout={(e) => (menuHeight.value = e.nativeEvent.layout.height + 8)} className="card bg-background border-foreground shadow-nb mt-1.5 gap-1.5 border-2 p-2">
                    {loading ? (
                        <View className="gap-2.5 p-2">
                            <SkeletonBlock className="h-5 w-full" />
                            <SkeletonBlock className="h-5 w-full" />
                            <SkeletonBlock className="h-5 w-full" />
                            <SkeletonBlock className="h-5 w-full" />
                        </View>
                    ) : (
                        parties.map((party, index) => {
                            const isSelected = selectedPartyCode === party.code;
                            const isLast = index === parties.length - 1;
                            return (
                                <Pressable
                                    key={party.id}
                                    onPress={() => onPartySelect(party.code)}
                                    className={cn("flex-row items-center justify-between rounded-none px-3.5 py-2.5", !isLast && !isSelected && "border-foreground border-b", isSelected ? "bg-amber" : "active:bg-muted")}
                                >
                                    <View className="flex-1 flex-row items-center justify-between gap-0.5">
                                        <Text className={cn("flex-1 text-lg font-extrabold", isSelected ? "text-black" : "text-foreground")}>{party.name}</Text>
                                        <Text className={cn("text-xs font-bold", isSelected ? "text-black/70" : "text-muted-foreground")}>Code: {party.code}</Text>
                                    </View>

                                    {isSelected && <Check size={16} color="#000" strokeWidth={3} />}
                                </Pressable>
                            );
                        })
                    )}
                </View>
            </Animated.View>
        </View>
    );
}
