import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import { useColor } from "@/hooks/custom/use-color";
import { cn } from "@/lib/utils";
import { Quest } from "@/types/models";
import { Award, CheckCircle2 } from "lucide-react-native";
import { View } from "react-native";

export default function QuestCard({ quest }: { quest: Quest }) {
    const color = useColor();

    return (
        <View className="border-foreground bg-card shadow-nb gap-3 rounded-2xl border-2 p-4">
            <View className="flex-row items-start justify-between gap-2">
                <View className="flex-1 gap-1">
                    <Text className="font-jakarta-bold text-base">{quest.title}</Text>
                    <Text className="text-muted-foreground font-jakarta-bold text-xs">
                        Assigned by <Text className="font-jakarta-extrabold">{quest.creatorId}</Text>
                    </Text>
                </View>

                <View className={cn(quest.difficulty, "shadow-nb border-foreground rounded-md border px-2.5 py-0.5")}>
                    <Text className="font-jakarta-extrabold text-xs uppercase">{quest.difficulty}</Text>
                </View>
            </View>

            <View className="border-border flex-row items-center justify-between border-t-2 pt-1">
                <View className="flex-row items-center gap-1">
                    <Award size={16} color={color.foreground} strokeWidth={2.5} />
                    <Text className="font-jakarta-extrabold text-sm">+{quest.reward} XP</Text>
                </View>

                <Button asChild size={"sm"}>
                    <CheckCircle2 size={14} color={"#000000"} strokeWidth={2.5} />
                    <Text className="font-jakarta-extrabold text-xs text-black">Complete</Text>
                </Button>
            </View>
        </View>
    );
}
