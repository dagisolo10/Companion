import { loadValue } from "@/utils/helper-functions";
import { Flame } from "lucide-react-native";
import Text from "@/components/ui/text";
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
                <View className="border-2 border-black bg-white p-2">
                    <Flame size={20} color="#DC2626" fill="#DC2626" strokeWidth={2.5} />
                </View>

                <View className="flex-1">
                    <Text className="text-xs font-extrabold tracking-wider text-black uppercase">Daily Momentum</Text>
                    <Text className="text-sm font-bold text-black">Keep going — {loadValue(loading, streak)}-day streak active!</Text>
                </View>
            </View>

            <View className="border-foreground border bg-black px-3 py-1">
                <Text className="text-xs font-extrabold text-white">Best: {loadValue(loading, longestStreak)}</Text>
            </View>
        </View>
    );
}
