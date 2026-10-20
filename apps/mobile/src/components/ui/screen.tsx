import { gradients } from "@/constants/gradients";
import { useColor } from "@/hooks/custom/use-color";
import { cn } from "cn";
import { LinearGradient } from "expo-linear-gradient";
import { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = PropsWithChildren & {
    className?: string;
    fullscreen?: boolean;
    scroll?: boolean;
};

export default function Screen({ children, scroll = true, fullscreen = false, className }: ScreenProps) {
    const color = useColor();

    return (
        <SafeAreaView style={{ backgroundColor: color.background, flex: 1 }} edges={["top"]}>
            <LinearGradient
                colors={gradients.screen}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.55 }}
                style={{
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 320,
                    position: "absolute",
                }}
                pointerEvents="none"
            />

            {scroll ? (
                <ScrollView
                    style={{ flex: 1 }}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingVertical: 16,
                        ...(fullscreen && { flex: 1 }),
                    }}
                >
                    <View className={cn(className, "flex-1")}>{children}</View>
                </ScrollView>
            ) : (
                <View className={cn(className, "flex-1 px-5 py-4")}>{children}</View>
            )}
        </SafeAreaView>
    );
}
