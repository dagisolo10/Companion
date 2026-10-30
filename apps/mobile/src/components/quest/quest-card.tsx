import QuestStatusBadge from "@/components/quest/quest-status-badge";
import DifficultyBadge from "@/components/quest/difficulty-badge";
import { Award, CheckCircle2 } from "lucide-react-native";
import { useColor } from "@/hooks/custom/use-color";
import { Quest } from "@companion/shared-types";
import { Pressable, View } from "react-native";
import Button from "@/components/ui/button";
import Text from "@/components/ui/text";


type QuestCardProps = {
    quest: Quest;
    onPress?: () => void;
    showComplete?: boolean;
    onComplete?: () => void;
};

export default function QuestCard({ quest, onPress, onComplete, showComplete = true }: QuestCardProps) {
    const color = useColor();

    return (
        <Pressable onPress={onPress} className="shadow-nb border-foreground gap-3 border-2 p-4">
            <View className="flex-row items-start justify-between gap-2">
                <View className="flex-1 gap-1">
                    <Text className="text-base font-extrabold">{quest.title}</Text>
                    <Text className="text-muted-foreground text-xs font-bold">
                        By <Text className="text-primary">{quest.creator.name}</Text>
                    </Text>
                </View>
                <DifficultyBadge difficulty={quest.difficulty} />
            </View>
            <View className="flex-row">
                <QuestStatusBadge status={quest.status} />
            </View>
            <View className="flex-row items-center justify-between border-t-2 border-zinc-800 pt-2">
                <View className="flex-row items-center gap-1.5">
                    <Award size={16} color={color.lime} strokeWidth={2.5} />
                    <Text className="text-lime text-sm font-extrabold">+{quest.reward} XP</Text>
                </View>
                {showComplete && quest.status === "Active" && onComplete && (
                    <Button onPress={onComplete} size="sm" asChild>
                        <CheckCircle2 size={14} color="#000000" strokeWidth={2.5} />
                        <Text className="text-xs font-extrabold text-black">Complete</Text>
                    </Button>
                )}
            </View>
        </Pressable>
    );
}
