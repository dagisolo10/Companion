import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from "react-native-reanimated";
import { View } from "react-native";
import { useEffect } from "react";
import { cn } from "cn";


export function SkeletonBlock({ className, index = 0, delay = 200 }: { className?: string; index?: number; delay?: number }) {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        const staggerDelay = index * delay;
        opacity.value = withDelay(staggerDelay, withRepeat(withTiming(1, { duration: 800 }), -1, true));
    }, [delay, index, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(opacity.value, [0.1, 1], [0.1, 0.2], Extrapolation.CLAMP),
    }));

    return <Animated.View style={animatedStyle} className={cn("bg-foreground", className)} />;
}

export function SkeletonCard({ lines = 3, className }: { lines?: number; className?: string }) {
    const lineArray = Array.from({ length: lines });

    const getWidthClass = (i: number) => {
        if (i === 0) return "h-4 w-3/4";
        if (i === 1) return "h-3 w-1/2";
        return "h-3 w-full";
    };

    return (
        <View className={cn("shadow-nb-sm border-foreground gap-3 border-2 p-4", className)}>
            {lineArray.map((_, index) => (
                <SkeletonBlock key={index} index={index} className={getWidthClass(index)} />
            ))}
        </View>
    );
}

export function SkeletonStat() {
    return (
        <View className="border-foreground bg-card shadow-nb flex-1 gap-3 border-2 p-4">
            <SkeletonBlock className="h-5 w-16" />
            <View className="gap-1">
                <SkeletonBlock className="h-7 w-14" />
                <SkeletonBlock className="h-3 w-20" />
            </View>
        </View>
    );
}

export function SkeletonLevelCard() {
    return (
        <View className="border-foreground shadow-nb gap-3 border-2 p-4">
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                    <SkeletonBlock className="h-10 w-10" />
                    <View className="gap-1">
                        <SkeletonBlock className="h-5 w-20" />
                        <SkeletonBlock className="h-3 w-16" />
                    </View>
                </View>
                <SkeletonBlock className="h-6 w-24" />
            </View>
            <SkeletonBlock className="h-4 w-full" />
        </View>
    );
}

export function SkeletonStreakCard() {
    return (
        <View className="border-foreground bg-amber shadow-nb border-2 p-3.5">
            <View className="flex-row items-center gap-3">
                <SkeletonBlock className="h-10 w-10" />
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

export function SkeletonQuestCard() {
    return (
        <View className="card gap-3">
            <View className="flex-row items-center justify-between">
                <SkeletonBlock className="h-6 w-2/3" />
                <SkeletonBlock className="h-5 w-16 rounded-full" />
            </View>
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-4/5" />
            <View className="mt-1 flex-row items-center justify-between">
                <SkeletonBlock className="h-4 w-20" />
                <SkeletonBlock className="border-foreground h-8 w-24 border-2" />
            </View>
        </View>
    );
}

export function SkeletonChatListItem() {
    return (
        <View className="border-foreground shadow-nb bg-card flex-row items-center gap-4 border-2 p-4">
            <View className="relative">
                <SkeletonBlock className="border-foreground bg-muted size-14 rounded-none border-2" />
                <View className="border-foreground bg-lime absolute -right-1 -bottom-1 size-4 rounded-none border-2" />
            </View>

            <View className="flex-1 gap-2.5">
                <View className="flex-row items-center justify-between">
                    <SkeletonBlock className="h-4 w-32 rounded-none" />
                    <SkeletonBlock className="h-3 w-12 rounded-none opacity-60" />
                </View>
                <View className="flex items-center gap-2">
                    <SkeletonBlock className="h-3.5 w-4/5 rounded-none" />
                </View>
            </View>

            <SkeletonBlock className="border-foreground bg-amber size-6 rounded-none border-2" />
        </View>
    );
}

export function SkeletonChatList({ count = 5 }: { count?: number }) {
    return (
        <View className="gap-4 px-4 py-3">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonChatListItem key={i} />
            ))}
        </View>
    );
}

export function SkeletonChatBubble({ align = "start", index = 0 }: { align?: "start" | "end"; index?: number }) {
    const isStart = align === "start";

    const structuralWidths = ["w-[55%]", "w-[75%]", "w-[65%]", "w-[85%]", "w-[45%]"];
    const currentWidth = structuralWidths[index % structuralWidths.length];

    const isVoiceNote = index % 4 === 3;

    return (
        <View className={cn("my-1 gap-1.5", isStart ? "items-start self-start" : "items-end self-end")}>
            {isStart && <SkeletonBlock className="bg-muted/80 ml-0.5 h-2.5 w-20 rounded-none" />}

            <View className={cn("border-foreground gap-2.5 rounded-none border-2 p-3.5", isStart ? "bg-card shadow-nb" : "bg-lime shadow-nb-sm", currentWidth)}>
                {isVoiceNote ? (
                    <View className="flex-row items-center justify-between gap-1 py-1">
                        <SkeletonBlock className="border-foreground bg-foreground size-7 rounded-none border-2" />
                        <SkeletonBlock className="h-2 flex-1 rounded-none" />
                        <SkeletonBlock className="h-3 w-8 rounded-none" />
                    </View>
                ) : (
                    <>
                        <SkeletonBlock className={cn("h-3.5 rounded-none", index % 2 === 0 ? "w-full" : "w-4/5")} />
                        {index % 3 !== 0 && <SkeletonBlock className="h-3.5 w-3/5 rounded-none opacity-80" />}
                    </>
                )}
            </View>

            <View className={cn("flex-row items-center gap-1.5 px-0.5 opacity-50", isStart ? "flex-row" : "flex-row-reverse")}>
                <SkeletonBlock className="h-2.5 w-10 rounded-none" />
                <SkeletonBlock className="bg-foreground size-1.5 rounded-none" />
            </View>
        </View>
    );
}

export function SkeletonChatRoom({ count = 6 }: { count?: number }) {
    return (
        <View className="gap-5 px-4 py-6">
            {Array.from({ length: count }).map((_, i) => {
                const alignmentMap: ("start" | "end")[] = ["start", "start", "end", "start", "end", "end"];
                const computedAlign = alignmentMap[i % alignmentMap.length];

                return <SkeletonChatBubble key={i} align={computedAlign} index={i} />;
            })}
        </View>
    );
}
