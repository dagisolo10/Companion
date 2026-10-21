import Text from "@/components/ui/text";
import { Party } from "@/types/models";
import { Users } from "lucide-react-native";
import { Pressable, View } from "react-native";

type PartyCardProps = {
    party: Party;
    memberCount?: number;
    onPress?: () => void;
};

export default function PartyCard({ party, memberCount, onPress }: PartyCardProps) {
    return (
        <Pressable onPress={onPress} className="shadow-nb border-foreground gap-3 rounded-2xl border-2 p-4">
            <View className="flex-row items-center justify-between">
                <View className="flex-1 gap-1">
                    <Text className="font-jakarta-extrabold text-base">{party.name}</Text>
                    <Text className="text-muted-foreground font-jakarta-bold text-xs">Code: {party.code}</Text>
                </View>
                <View className="border-foreground bg-purple items-center gap-1 rounded-xl border-2 px-2.5 py-1.5">
                    <Users size={14} color="#000000" strokeWidth={2.5} />
                    <Text className="font-jakarta-extrabold text-xs text-black">{memberCount ?? "—"}</Text>
                </View>
            </View>
        </Pressable>
    );
}
