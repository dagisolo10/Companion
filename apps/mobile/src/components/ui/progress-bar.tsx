import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useColor } from "@/hooks/custom/use-color";
import { View } from "react-native";
import { useEffect } from "react";
import { cn } from "cn";

export default function ProgressBar({ color, value }: { color?: string; value: number }) {
    const width = useSharedValue(0);

    useEffect(() => {
        width.value = withTiming(value, { duration: 1500, easing: Easing.bezier(0.25, 1, 0.5, 1) });
    }, [value, width]);

    const widthStyle = useAnimatedStyle(() => ({ width: `${width.value}%` }));

    const theme = useColor();
    const backgroundColor = color || theme.lime;

    return (
        <View className="border-foreground h-4 overflow-hidden border bg-black p-0.5">
            <Animated.View className={cn(color, "h-full border-r-2 border-white")} style={[widthStyle, { backgroundColor }]} />
        </View>
    );
}
