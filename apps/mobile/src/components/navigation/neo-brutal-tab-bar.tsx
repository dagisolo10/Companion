import Animated, { createAnimatedComponent, interpolate, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring } from "react-native-reanimated";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import type { BottomTabBarProps } from "expo-router/build/layouts/Tabs";
import { useCallback, useEffect, useState } from "react";
import TabItem from "@/components/navigation/tab-item";
import { scheduleOnRN } from "react-native-worklets";
import * as GlassEffect from "expo-glass-effect";
import { Pressable, View } from "react-native";
import Text from "@/components/ui/text";
import * as Haptics from "expo-haptics";
import { cn } from "cn";


const AnimatedGlassView = createAnimatedComponent(GlassEffect.GlassView);

export default function NeoBrutalTabBar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
    const [layoutWidth, setLayoutWidth] = useState(0);
    const numTabs = state.routes.length;
    const padding = 12;
    const widthPerTab = Math.max(0, (layoutWidth - padding) / numTabs);

    const position = useSharedValue(state.index);

    useEffect(() => {
        position.set(
            withSpring(state.index, {
                damping: 14,
                stiffness: 165,
                mass: 0.7,
            }),
        );
    }, [state.index, position]);

    const finishDrag = useCallback(
        (clampedIndex: number) => {
            if (clampedIndex !== state.index) {
                void Haptics.selectionAsync();
                const targetRoute = state.routes[clampedIndex];
                const event = emitter.emit({ type: "tabPress", target: targetRoute.key, canPreventDefault: true });
                if (!event.defaultPrevented) {
                    navigateToTab(targetRoute.key);
                }
            }
        },
        [state, emitter, navigateToTab],
    );

    const startIndex = useSharedValue(state.index);

    useEffect(() => {
        startIndex.set(state.index);
    }, [startIndex, state.index]);

    const panGesture = usePanGesture({
        activeOffsetX: [-8, 8],
        failOffsetY: [-2, 2],
        onActivate: () => {
            "worklet";
            startIndex.set(Math.round(position.get()));
        },
        onUpdate: (event) => {
            "worklet";
            if (widthPerTab <= 0) return;
            const fractionalOffset = event.translationX / widthPerTab;
            position.set(startIndex.get() + fractionalOffset);
        },
        onDeactivate: () => {
            "worklet";
            const targetIndex = Math.round(position.get());
            const clampedIndex = Math.max(0, Math.min(numTabs - 1, targetIndex));

            position.set(
                withSpring(clampedIndex, {
                    damping: 14,
                    stiffness: 165,
                    mass: 0.7,
                }),
            );

            scheduleOnRN(finishDrag, clampedIndex);
        },
    });

    const indicatorStyle = useAnimatedStyle(() => {
        const pos = position.value;
        const clampedPos = Math.max(0, Math.min(numTabs - 1, pos));
        const x = clampedPos * widthPerTab;

        const distanceFromCenter = Math.abs(pos - Math.round(pos));
        const stretch = interpolate(distanceFromCenter, [0, 0.5, 1], [1, 1.04, 1.08], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        });
        const scaleY = 1 / Math.sqrt(stretch);

        return {
            width: widthPerTab * stretch,
            transform: [{ translateX: x }, { scaleX: stretch }, { scaleY }],
        };
    });

    const tabScales = useDerivedValue(() => {
        "worklet";
        const pos = position.value;
        const scales: { scale: number; opacity: number }[] = [];
        for (let i = 0; i < numTabs; i++) {
            const distance = Math.abs(pos - i);
            const scale = interpolate(distance, [0, 0.5, 1, 2], [1.12, 1.05, 1, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
            });
            const opacity = interpolate(distance, [0, 1, 2.5], [1, 0.7, 0.5], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
            });
            scales.push({ scale, opacity });
        }
        return scales;
    }, [numTabs, position]);

    return (
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 50, paddingBottom: Math.max(insets.bottom - 6, 12) }} pointerEvents="box-none">
            <GestureDetector gesture={panGesture}>
                <Animated.View onLayout={(event) => setLayoutWidth(event.nativeEvent.layout.width)} className="border-foreground shadow-nb bg-card/90 relative flex-row items-center rounded-2xl border-2 p-2" style={{ marginHorizontal: 16, minHeight: 58 }}>
                    <AnimatedGlassView
                        style={{
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            borderRadius: 16,
                            position: "absolute",
                        }}
                        pointerEvents="none"
                        glassEffectStyle="regular"
                    />
                    <Animated.View pointerEvents="none" style={indicatorStyle} className="border-foreground bg-lime shadow-nb-sm absolute top-[6px] bottom-[6px] left-[6px] rounded-xl border-2" />
                    {state.routes.map((route, index) => {
                        const { options } = descriptors[route.key];
                        const label = options.title ?? route.name;
                        const focused = state.index === index;
                        const icon = options.tabBarIcon?.({ focused, color: "#000", size: 19 });
                        const badge = options.tabBarBadge;
                        const showBadge = badge !== undefined && badge !== null && badge !== 0 && badge !== "";

                        function onPress() {
                            const event = emitter.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                            if (!focused && !event.defaultPrevented) navigateToTab(route.key);
                        }

                        return (
                            <TabItem key={route.key} index={index} tabScales={tabScales}>
                                <Pressable
                                    onPress={onPress}
                                    accessibilityRole="tab"
                                    testID={options.tabBarButtonTestID}
                                    accessibilityState={{ selected: focused }}
                                    accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
                                    onLongPress={() => emitter.emit({ type: "tabLongPress", target: route.key })}
                                    className="z-10 min-h-12 flex-1 items-center justify-center gap-0.5 border-2 border-transparent px-1 py-1"
                                >
                                    {icon}
                                    {showBadge ? (
                                        <View className="border-foreground bg-destructive absolute top-1 right-1 min-w-5 items-center justify-center rounded-full border-2 px-1">
                                            <Text className="text-destructive-foreground font-jakarta-extrabold text-[9px]">{typeof badge === "number" && badge > 99 ? "99+" : badge}</Text>
                                        </View>
                                    ) : null}
                                    <Text className={cn("font-jakarta-extrabold text-[10px] text-black uppercase")} numberOfLines={1}>
                                        {label}
                                    </Text>
                                </Pressable>
                            </TabItem>
                        );
                    })}
                </Animated.View>
            </GestureDetector>
        </View>
    );
}
