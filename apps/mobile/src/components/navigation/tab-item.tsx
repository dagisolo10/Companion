import Animated, { useAnimatedStyle } from "react-native-reanimated";
import type { DerivedValue } from "react-native-reanimated";
import type { ReactNode } from "react";


interface TabItemProps {
    index: number;
    tabScales: DerivedValue<{ scale: number; opacity: number }[]>;
    children: ReactNode;
}

export default function TabItem({ index, tabScales, children }: TabItemProps) {
    const style = useAnimatedStyle(() => {
        const scales = tabScales.value;
        const item = scales[index] ?? { scale: 1, opacity: 1 };

        return {
            opacity: item.opacity,
            transform: [{ scale: item.scale }],
        };
    });

    return <Animated.View style={[style, { flex: 1 }]}>{children}</Animated.View>;
}
