import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import QuestCountdown from "@/components/quest/quest-countdown";
import { Clock, Hourglass, Timer } from "lucide-react-native";
import { formatDateTimeWithTime } from "@/utils/formatters";
import { Quest } from "@companion/shared-types";
import Text from "@/components/ui/text";
import { View } from "react-native";
import { useEffect } from "react";

type QuestScheduleCardProps = {
    quest: Quest;
};

export default function QuestScheduleCard({ quest }: QuestScheduleCardProps) {
    const rotation = useSharedValue(0);

    useEffect(() => {
        const interval = setInterval(() => {
            rotation.value = withSequence(withTiming(15, { duration: 100 }), withTiming(0, { duration: 150 }));
        }, 1000);

        return () => clearInterval(interval);
    }, [rotation]);

    const rotationAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const isFinished = quest.status === "Completed" || quest.status === "Expired";

    return (
        <View className="card border-foreground bg-card shadow-nb gap-3.5 border-2 p-4">
            <View className="flex-row items-center gap-2">
                <Clock size={18} color="#000" strokeWidth={2.5} />
                <Text className="text-foreground text-sm font-extrabold tracking-wide uppercase">Schedule & Timeline</Text>
            </View>

            <View className="flex-row gap-3">
                <View className="border-foreground bg-amber flex-1 gap-2 border-2 p-3 shadow-xs">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-[10px] font-extrabold tracking-widest text-black/70 uppercase">Starts</Text>
                        <Animated.View style={rotationAnimatedStyle}>
                            <Timer size={14} color="#000" strokeWidth={2.5} />
                        </Animated.View>
                    </View>

                    {!isFinished ? <QuestCountdown target={quest.startsAt} reachedLabel="Starting now" /> : <Text className="text-sm font-extrabold text-black">Started</Text>}

                    <Text className="text-[10px] font-bold text-black/60" numberOfLines={1}>
                        {formatDateTimeWithTime(quest.startsAt)}
                    </Text>
                </View>

                {quest.expiresAt && (
                    <View className="border-foreground bg-lime flex-1 gap-2 border-2 p-3 shadow-xs">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-[10px] font-extrabold tracking-widest text-black/70 uppercase">Expires</Text>
                            <Animated.View style={rotationAnimatedStyle}>
                                <Hourglass size={14} color="#000" strokeWidth={2.5} />
                            </Animated.View>
                        </View>

                        {!isFinished ? <QuestCountdown target={quest.expiresAt} reachedLabel="Expired" /> : <Text className="text-sm font-extrabold text-black">{quest.status === "Completed" ? "Completed" : "Expired"}</Text>}

                        <Text className="text-[10px] font-bold text-black/60" numberOfLines={1}>
                            {formatDateTimeWithTime(quest.expiresAt)}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}
