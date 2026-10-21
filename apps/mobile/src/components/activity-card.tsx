import Text from "@/components/ui/text";
import { useColor } from "@/hooks/custom/use-color";
import { cn } from "@/lib/utils";
import { QuestActivity } from "@/types/models";
import { relativeTime } from "@/utils/formatters";
import { CheckCircle2, Sparkles } from "lucide-react-native";
import { View } from "react-native";

const DIFFICULTY_BG: Record<string, string> = {
    Tiny: "bg-lime",
    Easy: "bg-amber",
    Normal: "bg-purple",
    Hard: "bg-pink",
    Major: "bg-destructive",
};

export default function ActivityCard({ activity }: { activity: QuestActivity }) {
    const color = useColor();
    const Icon = activity.quest.mode === "Race" ? Sparkles : CheckCircle2;
    const bg = DIFFICULTY_BG[activity.quest.difficulty] || "bg-muted";

    return (
        <View className="flex-row items-center justify-between p-2.5">
            <View className="flex-1 flex-row items-center gap-3">
                <View className={cn(bg, "border-foreground rounded-xl border-2 p-2")}>
                    <Icon size={16} color={color.black} strokeWidth={2.5} />
                </View>
                <View className="flex-1">
                    <Text className="font-jakarta-bold text-foreground text-sm" numberOfLines={1}>
                        {activity.user.name} completed &apos;{activity.quest.title}&apos;
                    </Text>
                    <Text className="text-muted-foreground font-jakarta-bold text-xs">
                        +{activity.quest.reward} XP • {activity.quest.party.name}
                    </Text>
                </View>
            </View>
            <Text className="text-muted-foreground font-jakarta-bold ml-2 text-[11px]">{relativeTime(activity.completedAt)}</Text>
        </View>
    );
}
