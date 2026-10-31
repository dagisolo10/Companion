import { House, MessageCircle, Search, UserRound, UsersRound } from "lucide-react-native";
import NeoBrutalTabBar from "@/components/navigation/neo-brutal-tab-bar";
import { useGetChatConversations } from "@/hooks/tan-stack/chat";
import { useColor } from "@/hooks/custom/use-color";
import { totalUnread } from "@/lib/chat-cache";
import { Tabs } from "expo-router";

export default function AppTabsLayout() {
    const color = useColor();
    const conversationsQuery = useGetChatConversations();
    const unread = totalUnread(conversationsQuery.data);

    return (
        <Tabs
            tabBar={(props) => <NeoBrutalTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: color.foreground,
                tabBarLabelStyle: { fontWeight: "700" },
                tabBarInactiveTintColor: color.mutedForeground,
                tabBarStyle: {
                    backgroundColor: "transparent",
                    borderTopColor: "transparent",
                    elevation: 0,
                    shadowOpacity: 0,
                },
            }}
        >
            <Tabs.Screen name="(home)" options={{ title: "Home", tabBarIcon: ({ color: iconColor, size }) => <House color={iconColor} size={size} /> }} />
            <Tabs.Screen name="(party)" options={{ title: "Party", tabBarIcon: ({ color: iconColor, size }) => <UsersRound color={iconColor} size={size} /> }} />
            <Tabs.Screen name="(chat)" options={{ title: "Chats", tabBarBadge: unread || undefined, tabBarIcon: ({ color: iconColor, size }) => <MessageCircle color={iconColor} size={size} /> }} />
            <Tabs.Screen name="(search)" options={{ title: "Search", tabBarIcon: ({ color: iconColor, size }) => <Search color={iconColor} size={size} /> }} />
            <Tabs.Screen name="(profile)" options={{ title: "Profile", tabBarIcon: ({ color: iconColor, size }) => <UserRound color={iconColor} size={size} /> }} />
        </Tabs>
    );
}
