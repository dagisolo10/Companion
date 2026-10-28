import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColor } from "@/hooks/custom/use-color";
import { PropsWithChildren } from "react";
import { cn } from "cn";


type ScreenProps = PropsWithChildren & {
    header?: boolean;
    className?: string;
    fullscreen?: boolean;
    nonScrollable?: boolean;
};

export default function Screen({ children, nonScrollable = false, fullscreen = false, header = false, className }: ScreenProps) {
    const color = useColor();

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <SafeAreaView collapsable={false} style={{ backgroundColor: color.background, flex: 1 }} edges={header ? [] : ["top"]}>
                {nonScrollable ? (
                    <View className={cn("flex-1 px-5 py-8", className)}>{children}</View>
                ) : (
                    <ScrollView
                        keyboardDismissMode="on-drag"
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        contentInsetAdjustmentBehavior={header ? "automatic" : "never"}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, ...(fullscreen && { flex: 1 }) }}
                    >
                        <View className={cn("flex-1", className)}>{children}</View>
                    </ScrollView>
                )}
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}
