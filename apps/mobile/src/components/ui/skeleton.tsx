import { cn } from "cn";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

function SkeletonBlock({ className }: { className?: string }) {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
    }, [opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(opacity.value, [0.3, 1], [0.3, 0.7], Extrapolation.CLAMP),
    }));

    return <Animated.View style={animatedStyle} className={cn("bg-muted rounded-xl", className)} />;
}

export function SkeletonCard({ lines = 3, className }: { lines?: number; className?: string }) {
    return (
        <View className={cn("shadow-nb-sm border-foreground gap-3 rounded-2xl border-2 p-4", className)}>
            <SkeletonBlock className="h-4 w-3/4" />
            <SkeletonBlock className="h-3 w-1/2" />
            {lines > 2 && <SkeletonBlock className="h-3 w-full" />}
        </View>
    );
}

export function SkeletonStat() {
    return (
        <View className="border-foreground bg-card shadow-nb flex-1 gap-3 rounded-2xl border-2 p-4">
            <SkeletonBlock className="h-5 w-16 rounded-md" />
            <View className="gap-1">
                <SkeletonBlock className="h-7 w-14" />
                <SkeletonBlock className="h-3 w-20" />
            </View>
        </View>
    );
}

export function SkeletonLevelCard() {
    return (
        <View className="border-foreground shadow-nb gap-3 rounded-2xl border-2 p-4">
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                    <SkeletonBlock className="h-10 w-10 rounded-xl" />
                    <View className="gap-1">
                        <SkeletonBlock className="h-5 w-20" />
                        <SkeletonBlock className="h-3 w-16" />
                    </View>
                </View>
                <SkeletonBlock className="h-6 w-24 rounded-full" />
            </View>
            <SkeletonBlock className="h-4 w-full rounded-full" />
        </View>
    );
}

export function SkeletonStreakCard() {
    return (
        <View className="border-foreground bg-amber shadow-nb rounded-2xl border-2 p-3.5">
            <View className="flex-row items-center gap-3">
                <SkeletonBlock className="h-10 w-10 rounded-xl" />
                <View className="flex-1 gap-1">
                    <SkeletonBlock className="h-3 w-24" />
                    <SkeletonBlock className="h-4 w-32" />
                </View>
            </View>
        </View>
    );
}

export function SkeletonQuestList({ count = 3 }: { count?: number }) {
    return (
        <View className="gap-3">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </View>
    );
}

export function SkeletonPartyList({ count = 3 }: { count?: number }) {
    return (
        <View className="gap-3">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} lines={2} />
            ))}
        </View>
    );
}

export default SkeletonBlock;
