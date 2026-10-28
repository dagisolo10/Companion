import Text from "@/components/ui/text";
import { loadValue } from "@/utils/helper-functions";
import { Flame } from "lucide-react-native";
import { View } from "react-native";

type StreakCardProps = {
    streak: number;
    loading: boolean;
    longestStreak: number;
};

export default function StreakCard({ streak, longestStreak, loading }: StreakCardProps) {
    return (
        <View className="card bg-amber flex-row items-center justify-between p-3.5">
            <View className="flex-1 flex-row items-center gap-3">
                <View className="rounded-xl border-2 border-black bg-white p-2">
                    <Flame size={20} color="#DC2626" fill="#DC2626" strokeWidth={2.5} />
                </View>

                <View className="flex-1">
                    <Text className="font-jakarta-extrabold text-xs tracking-wider text-black uppercase">Daily Momentum</Text>
                    <Text className="font-jakarta-bold text-sm text-black">Keep going — {loadValue(loading, streak)}-day streak active!</Text>
                </View>
            </View>

            <View className="border-foreground rounded-full border bg-black px-3 py-1">
                <Text className="font-jakarta-extrabold text-xs text-white">Best: {loadValue(loading, longestStreak)}</Text>
            </View>
        </View>
    );
}
