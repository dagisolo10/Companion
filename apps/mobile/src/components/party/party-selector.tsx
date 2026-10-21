import Text from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Party } from "@/types/models";
import { ChevronDown } from "lucide-react-native";
import { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, { createAnimatedComponent, Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

type PartySelectorProps = {
    parties: Party[];
    onPick: () => void;
    showPartyPicker: boolean;
    selectedParty: Party | undefined;
    onPartySelect: (code: string) => void;
    selectedPartyCode: string | undefined;
};

const AnimatedChevron = createAnimatedComponent(ChevronDown);

export default function PartySelector({ parties, showPartyPicker, selectedPartyCode, selectedParty, onPick, onPartySelect }: PartySelectorProps) {
    const rotation = useSharedValue(0);

    const progress = useSharedValue(0);
    const menuHeight = useSharedValue(0);

    useEffect(() => {
        rotation.value = withTiming(showPartyPicker ? 180 : 0, { duration: 300 });
        progress.value = withTiming(showPartyPicker ? 1 : 0, { duration: 300, easing: Easing.bezier(0.4, 0, 0.2, 1) });
    }, [progress, rotation, showPartyPicker]);

    const chevronStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
    const dynamicDropdownStyle = useAnimatedStyle(() => ({ opacity: progress.value, height: progress.value * menuHeight.value }));

    return (
        <View className="gap-1.5">
            <Text className="font-jakarta-bold text-sm">Party</Text>

            <Pressable onPress={onPick} className="border-border bg-muted z-10 h-14 flex-row items-center justify-between rounded-2xl px-4">
                <Text className={cn("font-jakarta-bold text-sm", !selectedPartyCode && "text-muted-foreground")}>{selectedParty ? selectedParty.name : "Select a party"}</Text>
                <AnimatedChevron size={18} color="#888" style={chevronStyle} />
            </Pressable>

            <Animated.View style={[dynamicDropdownStyle]}>
                <View onLayout={(e) => (menuHeight.value = e.nativeEvent.layout.height)} className="border-foreground bg-card shadow-nb mt-1 rounded-2xl border-2 p-2">
                    {parties.map((party) => (
                        <Pressable key={party.id} onPress={() => onPartySelect(party.code)} className={cn("rounded-xl px-4 py-3", selectedPartyCode === party.code && "bg-amber")}>
                            <Text className={cn("font-jakarta-bold text-sm", selectedPartyCode === party.code && "text-black")}>{party.name}</Text>
                            <Text className="text-muted-foreground font-jakarta-bold text-xs">{party.code}</Text>
                        </Pressable>
                    ))}
                </View>
            </Animated.View>
        </View>
    );
}
