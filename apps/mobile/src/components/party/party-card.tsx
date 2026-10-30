import Text from "@/components/ui/text";
import { PartyDetail } from "@/types/models";
import { router } from "expo-router";
import { ChevronRight, Users } from "lucide-react-native";
import { Pressable, View } from "react-native";

type PartyCardProps = {
    party: PartyDetail;
};

export default function PartyCard({ party }: PartyCardProps) {
    return (
        <Pressable onPress={() => router.push(`/(app)/(tabs)/(party)/${party.code}`)} className="card active:shadow-nb-active gap-3.5 transition-all duration-300 active:translate-x-[1px] active:translate-y-[1px]">
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
                    <Text className="text-xs font-extrabold text-black">{party._count.members ?? "—"}</Text>
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
