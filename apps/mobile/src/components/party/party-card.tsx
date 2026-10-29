import { ChevronRight, Users } from "lucide-react-native";
import { Pressable, View } from "react-native";
import Text from "@/components/ui/text";
import { Party } from "@/types/models";


type PartyCardProps = {
    party: Party;
    memberCount?: number;
    onPress?: () => void;
};

export default function PartyCard({ party, memberCount, onPress }: PartyCardProps) {
    return (
        <Pressable onPress={onPress} className="card active:shadow-nb-active gap-3.5 transition-all duration-300 active:translate-x-[1px] active:translate-y-[1px]">
            <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1 gap-1.5">
                    <Text className="text-lg font-extrabold tracking-tight" numberOfLines={1}>
                        {party.name}
                    </Text>

                    <View className="bg-muted border-foreground/30 self-start border px-2 py-0.5">
                        <Text className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">Code: {party.code}</Text>
                    </View>
                </View>

                <View className="border-foreground bg-purple flex-row items-center gap-1.5 border-2 px-3 py-1.5 shadow-xs">
                    <Users size={14} color="#000000" strokeWidth={2.5} />
                    <Text className="text-xs font-extrabold text-black">{memberCount ?? "—"}</Text>
                </View>
            </View>

            <View className="border-border/80 flex-row items-center justify-between border-t pt-2.5">
                <Text className="text-muted-foreground text-xs font-bold">Tap to view quests & members</Text>
                <View className="border-foreground bg-amber border-2 p-1">
                    <ChevronRight size={14} color="#000" strokeWidth={3} />
                </View>
            </View>
        </Pressable>
    );
}
