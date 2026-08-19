import Text from "@/components/ui/text";
import { Zap } from "lucide-react-native";
import { View } from "react-native";

export default function Experience() {
    return (
        <View className="border-foreground bg-card shadow-nb gap-3 rounded-2xl border-2 p-4">
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    <View className="border-foreground bg-purple rounded-lg border-2 p-1.5">
                        <Zap size={18} color={"#000000"} strokeWidth={2.5} />
                    </View>
                    <Text className="font-jakarta-extrabold text-lg">Level 5</Text>
                </View>
                <Text className="text-muted-foreground font-jakarta-bold text-sm">2450 / 3000 XP</Text>
            </View>

            <View className="border-foreground bg-muted h-4 overflow-hidden rounded-full border-2 p-0.5">
                <View className="border-foreground bg-lime h-full rounded-full" style={{ width: `${(2450 / 3000) * 100}%` }} />
            </View>
        </View>
    );
}
