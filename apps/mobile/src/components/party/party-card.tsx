import { cn } from "@/lib/utils";
import { View } from "react-native";
import Text from "@/components/ui/text";
import { PartyMember } from "@/types/models";

export default function PartyCard() {
    return (
        <View className="border-foreground bg-card shadow-nb gap-3 rounded-2xl border-2 p-4">
            <View className="flex-row items-center justify-between">
                <Text className="font-jakarta-extrabold text-base">Night Own</Text>
                <Text className="text-muted-foreground font-jakarta-bold text-xs">Code: NW-8921</Text>
            </View>

            <View className="flex-row items-center gap-3">
                {([] as PartyMember[]).map((member) => (
                    <View key={member.id} className="items-center gap-1">
                        <View className={cn("bg-pink border-foreground shadow-nb h-10 w-10 items-center justify-center rounded-xl border-2")}>
                            <Text className="font-jakarta-extrabold text-base text-black">J</Text>
                        </View>
                        <Text className="font-jakarta-bold text-xs">John</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
