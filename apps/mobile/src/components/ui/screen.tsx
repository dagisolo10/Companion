import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import type { ScrollViewInstance } from "react-native";
import { PropsWithChildren, RefObject } from "react";
import { useColor } from "@/hooks/custom/use-color";
import { cn } from "cn";


type ScreenProps = PropsWithChildren & {
    header?: boolean;
    className?: string;
    fullscreen?: boolean;
    nonScrollable?: boolean;
    scrollRef?: RefObject<ScrollViewInstance | null>;
};

export default function Screen({ children, nonScrollable = false, fullscreen = false, header = false, className, scrollRef }: ScreenProps) {
    const insets = useSafeAreaInsets();
    const color = useColor();

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <SafeAreaView collapsable={false} style={{ backgroundColor: color.background, flex: 1 }} edges={header ? [] : ["top"]}>
                {nonScrollable ? (
                    <View className={cn("flex-1 px-5 py-8", className)}>{children}</View>
                ) : (
                    <ScrollView
                        ref={scrollRef}
                        keyboardDismissMode="on-drag"
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        contentInsetAdjustmentBehavior={header ? "automatic" : "never"}
                        contentContainerStyle={{ flexGrow: 1, ...(fullscreen && { flex: 1 }) }}
                    >
                        <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 96, paddingVertical: 16 }} className={cn(fullscreen && "flex-1", className)}>
                            {children}
                        </View>
                    </ScrollView>
                )}
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}
