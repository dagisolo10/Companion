import { useColor } from "@/hooks/custom/use-color";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function AndroidAppTabsLayout() {
    const color = useColor();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: color.primary,
                tabBarInactiveTintColor: color.mutedForeground,
                tabBarStyle: { backgroundColor: color.background, borderColor: "transparent" },
            }}
        >
            <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ focused, size }) => <Ionicons name="home" color={focused ? color.foreground : color.mutedForeground} size={size} /> }} />
            <Tabs.Screen name="(parties)" options={{ title: "Party", tabBarIcon: ({ focused, size }) => <Ionicons name="people-sharp" color={focused ? color.foreground : color.mutedForeground} size={size} /> }} />
            <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ focused, size }) => <Ionicons name="person-circle-sharp" color={focused ? color.foreground : color.mutedForeground} size={size} /> }} />
            <Tabs.Screen name="search" options={{ title: "Search", tabBarIcon: ({ focused, size }) => <Ionicons name="search-sharp" color={focused ? color.foreground : color.mutedForeground} size={size} /> }} />
        </Tabs>
    );
}
