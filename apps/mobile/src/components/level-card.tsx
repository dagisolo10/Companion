import ProgressBar from "@/components/ui/progress-bar";
import { useColor } from "@/hooks/custom/use-color";
import { getLevel } from "@/utils/helper-functions";
import { Zap } from "lucide-react-native";
import Text from "@/components/ui/text";
import { View } from "react-native";


type LevelCardProps = {
    loading: boolean;
    experience: number;
};

export default function LevelCard({ experience, loading }: LevelCardProps) {
    const color = useColor();
    const { level, label, nextLevel, nextLevelXp, currentLevelMinXp } = getLevel(experience);
    const isMaxLevel = nextLevelXp === null;

    const progress = calculateLevelProgress(experience, currentLevelMinXp, nextLevelXp);

    return (
        <View className="card gap-3">
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                    <View className="border-foreground bg-purple border-2 p-2">
                        <Zap size={20} color={color.white} strokeWidth={2.5} />
                    </View>
                    <View>
                        <Text className="text-xl leading-none font-extrabold">Level {loading ? "-" : level}</Text>
                        <Text className="text-muted-foreground mt-0.5 text-xs font-bold">{loading ? "-" : label}</Text>
                    </View>
                </View>
                <View className="border-foreground bg-muted border-2 px-3 py-1">
                    <Text className="text-xs font-extrabold">
                        {loading ? "-" : experience} / {loading ? "-" : isMaxLevel ? "MAX" : nextLevelXp} XP
                    </Text>
                </View>
            </View>
            <View className="gap-1.5">
                <ProgressBar value={progress} />
                <View className="flex-row items-center justify-between">
                    <Text className="text-xs font-bold">XP BAR</Text>
                    <Text className="text-muted-foreground text-right text-[11px] font-bold">{loading ? "-" : isMaxLevel ? "Max Level Reached" : `${nextLevelXp - experience} XP to Level ${nextLevel}`}</Text>
                </View>
            </View>
        </View>
    );
}

function calculateLevelProgress(totalXp: number, currentLevelMinXp: number, nextLevelMinXp: number | null): number {
    if (nextLevelMinXp === null || nextLevelMinXp <= currentLevelMinXp) {
        return 100;
    }

    const xpIntoCurrentLevel = totalXp - currentLevelMinXp;
    const levelInterval = nextLevelMinXp - currentLevelMinXp;

    if (levelInterval <= 0) return 100;

    const progress = Math.max(xpIntoCurrentLevel / levelInterval, 0) * 100;

    return Math.min(progress, 100);
}
