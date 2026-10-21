import DifficultyBadge from "@/components/difficulty-badge";
import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import { useColor } from "@/hooks/custom/use-color";
import { Quest } from "@/types/models";
import { Award, CheckCircle2 } from "lucide-react-native";
import { Pressable, View } from "react-native";

type QuestCardProps = {
    quest: Quest;
    onPress?: () => void;
    showComplete?: boolean;
    onComplete?: () => void;
};

export default function QuestCard({ quest, onPress, onComplete, showComplete = true }: QuestCardProps) {
    const color = useColor();

    return (
        <Pressable onPress={onPress} className="shadow-nb border-foreground gap-3 rounded-2xl border-2 p-4">
            <View className="flex-row items-start justify-between gap-2">
                <View className="flex-1 gap-1">
                    <Text className="font-jakarta-extrabold text-base">{quest.title}</Text>
                    <Text className="font-jakarta-bold text-muted-foreground text-xs">
                        By <Text className="text-primary">{quest.creator.name}</Text>
                    </Text>
                </View>
                <DifficultyBadge difficulty={quest.difficulty} />
            </View>
            <View className="flex-row items-center justify-between border-t-2 border-zinc-800 pt-2">
                <View className="flex-row items-center gap-1.5">
                    <Award size={16} color={color.lime} strokeWidth={2.5} />
                    <Text className="font-jakarta-extrabold text-lime text-sm">+{quest.reward} XP</Text>
                </View>
                {showComplete && quest.status === "Active" && onComplete && (
                    <Button onPress={onComplete} size="sm" asChild>
                        <CheckCircle2 size={14} color="#000000" strokeWidth={2.5} />
                        <Text className="font-jakarta-extrabold text-xs text-black">Complete</Text>
                    </Button>
                )}
            </View>
        </Pressable>
    );
}
