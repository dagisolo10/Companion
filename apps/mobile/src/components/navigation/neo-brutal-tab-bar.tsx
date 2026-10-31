import Animated, { useAnimatedStyle, useDerivedValue, withSpring } from "react-native-reanimated";
import type { BottomTabBarProps } from "expo-router/build/layouts/Tabs";
import { Pressable, View } from "react-native";
import Text from "@/components/ui/text";
import { useState } from "react";
import { cn } from "cn";

export default function NeoBrutalTabBar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
    const [layoutWidth, setLayoutWidth] = useState(0);
    const widthPerTab = Math.max(0, (layoutWidth - 12) / state.routes.length);
    const indicatorX = useDerivedValue(() =>
        withSpring(state.index * widthPerTab, {
            damping: 14,
            stiffness: 165,
            mass: 0.7,
        }),
    );
    const indicatorStyle = useAnimatedStyle(() => ({
        width: widthPerTab,
        transform: [{ translateX: indicatorX.value }],
    }));

    return (
        <View className="border-foreground bg-background border-t-2 px-3 pt-2" style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
            <View onLayout={(event) => setLayoutWidth(event.nativeEvent.layout.width)} className="border-foreground bg-card shadow-nb relative flex-row border-2 p-1">
                <Animated.View pointerEvents="none" style={indicatorStyle} className="border-foreground bg-lime shadow-nb-sm absolute top-[6px] bottom-[6px] left-[6px] border-2" />
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label = options.title ?? route.name;
                    const focused = state.index === index;
                    const color = focused ? "#000" : (options.tabBarInactiveTintColor ?? "#737373");
                    const icon = options.tabBarIcon?.({ focused, color, size: 19 });
                    const badge = options.tabBarBadge;
                    const showBadge = badge !== undefined && badge !== null && badge !== 0 && badge !== "";

                    function onPress() {
                        const event = emitter.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                        if (!focused && !event.defaultPrevented) navigateToTab(route.key);
                    }

                    return (
                        <Pressable
                            key={route.key}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: focused }}
                            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
                            testID={options.tabBarButtonTestID}
                            onPress={onPress}
                            onLongPress={() => emitter.emit({ type: "tabLongPress", target: route.key })}
                            className="z-10 min-h-14 flex-1 items-center justify-center gap-0.5 border-2 border-transparent px-1 py-1.5"
                        >
                            {icon}
                            {showBadge ? (
                                <View className="border-foreground bg-destructive absolute top-1 right-2 min-w-5 items-center justify-center rounded-full border-2 px-1">
                                    <Text className="text-destructive-foreground text-[9px] font-extrabold">{typeof badge === "number" && badge > 99 ? "99+" : badge}</Text>
                                </View>
                            ) : null}
                            <Text className={cn("text-[10px] font-extrabold uppercase", focused ? "text-black" : "text-muted-foreground")} numberOfLines={1}>
                                {label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}
