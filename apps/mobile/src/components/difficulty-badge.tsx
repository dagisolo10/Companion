import Text from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Difficulty } from "@/types/models";
import { CircleDot, Crown, Flame, Trophy, Zap } from "lucide-react-native";
import { View } from "react-native";

const CONFIG: Record<Difficulty, { bg: string; Icon: typeof CircleDot }> = {
    Tiny: { bg: "bg-lime", Icon: CircleDot },
    Easy: { bg: "bg-amber", Icon: Zap },
    Normal: { bg: "bg-purple", Icon: Flame },
    Hard: { bg: "bg-pink", Icon: Trophy },
    Major: { bg: "bg-destructive", Icon: Crown },
};

export default function DifficultyBadge({ difficulty, size = "sm" }: { difficulty: Difficulty; size?: "sm" | "lg" | "icon" }) {
    const { bg, Icon } = CONFIG[difficulty];

    if (size === "icon") {
        return (
            <View className={cn(bg, "border-foreground h-9 w-9 items-center justify-center rounded-full border-2")}>
                <Icon size={16} color="#000000" strokeWidth={2.5} />
            </View>
        );
    }

    if (size === "lg") {
        return (
            <View className={cn(bg, "border-foreground flex-row items-center gap-1.5 rounded-xl border-2 px-3 py-1.5")}>
                <Icon size={14} color="#000000" strokeWidth={2.5} />
                <Text className="font-jakarta-extrabold text-xs uppercase">{difficulty}</Text>
            </View>
        );
    }

    return (
        <View className={cn(bg, "border-foreground flex-row items-center gap-1 rounded-md border px-2 py-0.5")}>
            <Icon size={10} color="#000000" strokeWidth={3} />
            <Text className="font-jakarta-extrabold text-[10px] uppercase">{difficulty}</Text>
        </View>
    );
}
