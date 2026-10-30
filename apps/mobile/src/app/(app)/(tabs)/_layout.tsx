import { House, Search, UserRound, UsersRound } from "lucide-react-native";
import NeoBrutalTabBar from "@/components/navigation/neo-brutal-tab-bar";
import { useColor } from "@/hooks/custom/use-color";
import { Tabs } from "expo-router";

export default function AppTabsLayout() {
    const color = useColor();

    return (
        <Tabs
            tabBar={(props) => <NeoBrutalTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: color.foreground,
                tabBarLabelStyle: { fontWeight: "700" },
                tabBarInactiveTintColor: color.mutedForeground,
                tabBarStyle: { backgroundColor: color.background, borderTopColor: color.border },
            }}
        >
            <Tabs.Screen name="(home)" options={{ title: "Home", tabBarIcon: ({ color: iconColor, size }) => <House color={iconColor} size={size} /> }} />
            <Tabs.Screen name="(party)" options={{ title: "Party", tabBarIcon: ({ color: iconColor, size }) => <UsersRound color={iconColor} size={size} /> }} />
            <Tabs.Screen name="(search)" options={{ title: "Search", tabBarIcon: ({ color: iconColor, size }) => <Search color={iconColor} size={size} /> }} />
            <Tabs.Screen name="(profile)" options={{ title: "Profile", tabBarIcon: ({ color: iconColor, size }) => <UserRound color={iconColor} size={size} /> }} />
        </Tabs>
    );
}
