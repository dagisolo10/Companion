import { useColor } from "@/hooks/custom/use-color";
import { cn } from "@/lib/utils";
import React, { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = PropsWithChildren & {
    className?: string;
    fullscreen?: boolean;
    nonScrollable?: boolean;
};

export default function Screen({ children, nonScrollable = false, fullscreen = false, className }: ScreenProps) {
    const color = useColor();

    return (
        <SafeAreaView style={{ backgroundColor: color.background, flex: 1 }} edges={["top"]}>
            {nonScrollable ? (
                <View className={cn(className, "flex-1 px-5 py-4")}>{children}</View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, ...(fullscreen && { flex: 1 }) }}>
                    <View className={cn(className, "flex-1")}>{children}</View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
