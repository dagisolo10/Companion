import { cn } from "@/lib/utils";
import { View } from "react-native";
import { useColor } from "@/hooks/custom/use-color";

export default function ProgressBar({ color, value }: { color?: string; value: number }) {
    const theme = useColor();
    const backgroundColor = color || theme.lime;

    return (
        <View className="border-foreground h-4 overflow-hidden rounded-full border bg-black p-0.5">
            <View className={cn(color, "h-full rounded-full border-r-2 border-white")} style={{ backgroundColor, width: `${value}%` }} />
        </View>
    );
}
