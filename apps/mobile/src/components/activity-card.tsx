import { CheckCircle2, Sparkles } from "lucide-react-native";
import { useColor } from "@/hooks/custom/use-color";
import { relativeTime } from "@/utils/formatters";
import { QuestActivity } from "@/types/models";
import Text from "@/components/ui/text";
import { View } from "react-native";
import { cn } from "cn";


const DIFFICULTY_BG: Record<string, string> = {
    Tiny: "bg-lime",
    Hard: "bg-pink",
    Easy: "bg-amber",
    Normal: "bg-purple",
    Major: "bg-destructive",
};

export default function ActivityCard({ activity }: { activity: QuestActivity }) {
    const color = useColor();
    const Icon = activity.quest.mode === "Rush" ? Sparkles : CheckCircle2;
    const bg = DIFFICULTY_BG[activity.quest.difficulty] || "bg-muted";

    return (
        <View className="flex-row items-center justify-between p-2.5">
            <View className="flex-1 flex-row items-center gap-3">
                <View className={cn(bg, "border-foreground border-2 p-2")}>
                    <Icon size={16} color={color.black} strokeWidth={2.5} />
                </View>
                <View className="flex-1">
                    <Text className="text-foreground text-sm font-bold" numberOfLines={1}>
                        {activity.user.name} completed &apos;{activity.quest.title}&apos;
                    </Text>
                    <Text className="text-muted-foreground text-xs font-bold">
                        {activity.xpAwarded > 0 ? `+${activity.xpAwarded} XP` : "No XP"} • {activity.quest.party.name}
                    </Text>
                </View>
            </View>
            <Text className="text-muted-foreground ml-2 text-[11px] font-bold">{relativeTime(activity.completedAt)}</Text>
        </View>
    );
}
