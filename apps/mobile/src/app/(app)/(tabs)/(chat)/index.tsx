import LargeHeader from "@/components/common/large-header";
import EmptyState from "@/components/ui/empty-state";
import Screen from "@/components/ui/screen";
import Text from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useColor } from "@/hooks/custom/use-color";
import { useGetChatConversations } from "@/hooks/tan-stack/chat";
import { totalUnread } from "@/lib/chat-cache";
import { relativeTime } from "@/utils/formatters";
import { cn } from "cn";
import { router } from "expo-router";
import { Bell, MessageCircle } from "lucide-react-native";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";

const AVATAR_COLORS = ["bg-lime", "bg-pink", "bg-amber", "bg-purple"];

export default function ChatsScreen() {
    const { user } = useAuth();
    const color = useColor();
    const conversationsQuery = useGetChatConversations();
    const conversations = conversationsQuery.data;
    const unread = totalUnread(conversations);
    const unreadChats = conversations.filter((conversation) => conversation.unreadCount > 0).length;

    return (
        <Screen nonScrollable className="pb-0">
            <FlatList
                style={{ flex: 1 }}
                data={conversations}
                keyExtractor={(conversation) => conversation.party.id}
                contentContainerStyle={{ gap: 12, paddingBottom: 24, flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View className="mb-2 gap-1">
                        <LargeHeader header="Chats" />
                        <Text className="text-muted-foreground font-jakarta-bold text-sm">Talk with your party while you quest.</Text>
                        {unread > 0 ? (
                            <View className="border-foreground bg-amber shadow-nb-sm mt-2 flex-row items-center gap-3 border-2 p-3">
                                <View className="border-foreground bg-card size-10 items-center justify-center border-2">
                                    <Bell size={18} color={color.foreground} strokeWidth={2.5} />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-jakarta-extrabold text-sm">
                                        {unread} unread {unread === 1 ? "message" : "messages"}
                                    </Text>
                                    <Text className="text-muted-foreground font-jakarta-bold text-[11px]">
                                        Across {unreadChats} {unreadChats === 1 ? "chat" : "chats"}
                                    </Text>
                                </View>
                            </View>
                        ) : null}
                    </View>
                }
                renderItem={({ item: conversation, index }) => {
                    const { party, lastMessage, unreadCount } = conversation;
                    const preview = lastMessage ? `${lastMessage.senderId === user?.id ? "You" : lastMessage.sender.name}: ${lastMessage.content}` : "No messages yet";
                    const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

                    return (
                        <Pressable
                            onPress={() => router.push({ pathname: "/(app)/(tabs)/(chat)/[code]", params: { code: party.code } })}
                            className="card active:shadow-nb-active flex-row items-center gap-3 transition-all duration-300 active:translate-x-[1px] active:translate-y-[1px]"
                        >
                            <View className={cn(avatarColor, "border-foreground shadow-nb-sm size-12 items-center justify-center border-2")}>
                                <Text className="font-jakarta-extrabold text-lg text-black">{party.name.charAt(0).toUpperCase()}</Text>
                            </View>

                            <View className="flex-1 gap-0.5">
                                <View className="flex-row items-center justify-between gap-2">
                                    <Text className="font-jakarta-extrabold flex-1 text-base" numberOfLines={1}>
                                        {party.name}
                                    </Text>
                                    {lastMessage ? <Text className="text-muted-foreground font-jakarta-bold text-[10px]">{relativeTime(lastMessage.createdAt)}</Text> : null}
                                </View>
                                <Text className={cn("font-jakarta-bold text-xs", unreadCount > 0 ? "text-foreground" : "text-muted-foreground")} numberOfLines={1}>
                                    {preview}
                                </Text>
                            </View>

                            {unreadCount > 0 ? (
                                <View className="border-foreground bg-destructive min-w-6 items-center justify-center rounded-full border-2 px-1.5 py-0.5">
                                    <Text className="text-destructive-foreground font-jakarta-extrabold text-[10px]">{unreadCount > 99 ? "99+" : unreadCount}</Text>
                                </View>
                            ) : null}
                        </Pressable>
                    );
                }}
                ListEmptyComponent={
                    conversationsQuery.isFetching ? (
                        <View className="flex-1 items-center justify-center py-16">
                            <ActivityIndicator />
                        </View>
                    ) : (
                        <EmptyState icon={MessageCircle} title="No conversations yet" description="Join a party to start chatting with your companions." actionLabel="Find a party" onAction={() => router.push("/(app)/(tabs)/(party)")} />
                    )
                }
                ListFooterComponent={conversationsQuery.isFetching && conversations.length > 0 ? <ActivityIndicator /> : undefined}
            />
        </Screen>
    );
}
