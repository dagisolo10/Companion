import { applyChatMessage, applyChatMessageDelete, applyChatMessageUpdate, applyChatRead, setConversationUnread } from "@/lib/chat-cache";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, TextInput, View } from "react-native";
import { ArrowDown, Check, ChevronLeft, MessageCircle, Send, X } from "lucide-react-native";
import { useGetChatMessagesInfinite, useGetChatPresence } from "@/hooks/tan-stack/chat";
import type { ChatMessage, ChatTypingEvent } from "@companion/shared-types";
import MessageActionsDialog from "@/components/chat/message-actions-dialog";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useConfirmDialog from "@/hooks/custom/use-confirm-dialog";
import { SafeAreaView } from "react-native-safe-area-context";
import { SkeletonChatRoom } from "@/components/ui/skeleton";
import { useSocketIo } from "@/contexts/socket.io-context";
import { ScrollView } from "react-native-gesture-handler";
import { useQueryClient } from "@tanstack/react-query";
import { useGetParty } from "@/hooks/tan-stack/party";
import EmptyState from "@/components/ui/empty-state";
import { useGetUser } from "@/hooks/tan-stack/user";
import { useColor } from "@/hooks/custom/use-color";
import { useAuth } from "@/contexts/auth-context";
import useToast from "@/hooks/custom/use-toast";
import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import { cn } from "cn";
import { formatDateSeparator, getDateString } from "@/utils/formatters";


type PendingMessage = {
    clientId: string;
    content: string;
    createdAt: string;
    status: "sending" | "failed";
};

type ChatListItem = { type: "message"; message: ChatMessage } | { type: "pending"; pending: PendingMessage } | { type: "dateSeparator"; date: string };

const ACK_TIMEOUT_MS = 15000;

function formatMessageTime(date: string) {
    return new Date(date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function ChatRoomScreen() {
    const { code } = useLocalSearchParams<{ code: string }>();
    const color = useColor();
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const { showConfirmDialog, confirmDialog } = useConfirmDialog();
    const { socket, connected, setActiveChatCode } = useSocketIo();
    const { user } = useAuth();

    const partyQuery = useGetParty(code!);
    const userQuery = useGetUser();
    const messagesQuery = useGetChatMessagesInfinite(code!);
    const presenceQuery = useGetChatPresence(code!);

    const [draft, setDraft] = useState("");
    const [pending, setPending] = useState<PendingMessage[]>([]);
    const [typingUsers, setTypingUsers] = useState<{ userId: string; name: string }[]>([]);
    const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
    const [actionMessage, setActionMessage] = useState<ChatMessage | null>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [localUnreadCount, setLocalUnreadCount] = useState(0);

    const pendingTimeouts = useRef(new Map<string, ReturnType<typeof setTimeout>>());
    const typingTimeouts = useRef(new Map<string, ReturnType<typeof setTimeout>>());
    const typingSentRef = useRef(false);
    const flatListRef = useRef<FlatList>(null);
    const lastMessageCountRef = useRef(0);
    const isAtBottomRef = useRef(true);
    const hasSetBaselineRef = useRef(false);

    const messages = messagesQuery.data;
    const party = partyQuery.data;
    const onlineCount = presenceQuery.data.onlineUserIds.length;

    const listData = useMemo<ChatListItem[]>(() => {
        // Combine pending and server messages, then insert date separators
        const items: ChatListItem[] = [
            ...pending.map((item) => ({ type: "pending" as const, pending: item })),
            ...messages.map((message) => ({ type: "message" as const, message })),
        ];

        const result: ChatListItem[] = [];
        let lastDate: string | null = null;
        let pendingSeparator: { type: "dateSeparator"; date: string } | null = null;

        for (const item of items) {
            const createdAt = item.type === "message" ? item.message.createdAt : item.type === "pending" ? item.pending.createdAt : "";
            const dateStr = getDateString(createdAt);

            if (dateStr !== lastDate) {
                // In an inverted FlatList, items later in the array render higher on screen.
                // Insert the separator AFTER the messages of the previous day so it appears at the TOP of the new day.
                if (pendingSeparator) {
                    result.push(pendingSeparator);
                }
                pendingSeparator = { type: "dateSeparator", date: createdAt };
                lastDate = dateStr;
            }
            result.push(item);
        }

        // Push the last separator (for the most recent day) at the end
        if (pendingSeparator) {
            result.push(pendingSeparator);
        }

        return result;
    }, [messages, pending]);

    const markRead = useCallback(() => {
        if (!socket || !connected) return;

        socket.emit("chat:read", { partyCode: code! }, (result) => {
            if (result.ok) applyChatRead(queryClient, code!, result.lastReadAt);
        });
    }, [code, connected, queryClient, socket]);

    // In an inverted FlatList, scrollOffset=0 means the user is at the bottom (newest messages)
    const onScroll = useCallback(
        (nativeEvent: { nativeEvent: { contentOffset: { y: number }; layoutMeasurement: { height: number }; contentSize: { height: number } } }) => {
            const { y: scrollOffset } = nativeEvent.nativeEvent.contentOffset;
            const layoutH = nativeEvent.nativeEvent.layoutMeasurement.height;
            const contentH = nativeEvent.nativeEvent.contentSize.height;

            // In inverted list: scrollOffset=0 is bottom (newest). User is at bottom if they can't scroll further down.
            const atBottom = contentH <= layoutH || scrollOffset < 100;
            const wasAtBottom = isAtBottom;
            setIsAtBottom(atBottom);
            isAtBottomRef.current = atBottom;

            // If user just scrolled to the bottom and had unread messages, mark them as read
            if (atBottom && !wasAtBottom && localUnreadCount > 0) {
                setConversationUnread(queryClient, code!, 0);
                markRead();
                setLocalUnreadCount(0);
            }
        },
        [isAtBottom, localUnreadCount, markRead, code, queryClient],
    );

    const removePending = useCallback((clientId: string) => {
        setPending((current) => current.filter((item) => item.clientId !== clientId));
    }, []);

    const markFailed = useCallback((clientId: string) => {
        setPending((current) => current.map((item) => (item.clientId === clientId ? { ...item, status: "failed" } : item)));
    }, []);

    const sendMessage = useCallback(
        (clientId: string, content: string) => {
            if (!socket || !connected) {
                markFailed(clientId);
                return;
            }

            const timeout = setTimeout(() => {
                pendingTimeouts.current.delete(clientId);
                markFailed(clientId);
            }, ACK_TIMEOUT_MS);

            pendingTimeouts.current.set(clientId, timeout);

            socket.emit("chat:send", { partyCode: code!, content, clientId }, (result) => {
                const currentTimeout = pendingTimeouts.current.get(clientId);
                if (currentTimeout) clearTimeout(currentTimeout);
                pendingTimeouts.current.delete(clientId);

                if (result.ok) {
                    removePending(clientId);
                    applyChatMessage(queryClient, code!, result.message, user?.id, code!);
                } else {
                    markFailed(clientId);
                }
            });
        },
        [connected, code, markFailed, queryClient, removePending, socket, user?.id],
    );

    useFocusEffect(
        useCallback(() => {
            setActiveChatCode(code!);

            return () => setActiveChatCode(null);
        }, [code, setActiveChatCode]),
    );

    // Track server-side message count to detect new messages and handle read/unread state
    // Uses messages.length (not listData.length) so pending messages don't skew the unread count
    const serverMessageCount = messages?.length ?? 0;
    useEffect(() => {
        // Wait for messages to load before setting baseline
        if (messages === undefined) return;

        if (!hasSetBaselineRef.current) {
            hasSetBaselineRef.current = true;
            lastMessageCountRef.current = serverMessageCount;
            // On initial load, if at bottom, mark all messages as read
            if (isAtBottomRef.current) {
                setConversationUnread(queryClient, code!, 0);
                markRead();
            }
            return;
        }

        const diff = serverMessageCount - lastMessageCountRef.current;
        if (diff > 0) {
            if (isAtBottomRef.current) {
                // At bottom — messages are visible, clear cache and mark read
                setConversationUnread(queryClient, code!, 0);
                markRead();
            } else {
                // Not at bottom — these are unread messages, track local count for floating button
                // Cache already incremented by applyChatMessage in the socket provider
                setLocalUnreadCount((prev) => prev + diff);
            }
        }
        lastMessageCountRef.current = serverMessageCount;
    }, [serverMessageCount, messages, code, queryClient, markRead]);

    useEffect(() => {
        if (!socket) return;

        const timeouts = typingTimeouts.current;

        function handleTyping(event: ChatTypingEvent) {
            if (event.partyCode !== code || event.userId === user?.id) return;

            setTypingUsers((current) => {
                if (!event.isTyping) return current.filter((item) => item.userId !== event.userId);
                return current.some((item) => item.userId === event.userId) ? current : [...current, { userId: event.userId, name: event.name }];
            });

            const currentTimeout = timeouts.get(event.userId);
            if (currentTimeout) clearTimeout(currentTimeout);

            if (event.isTyping) {
                const timeout = setTimeout(() => {
                    setTypingUsers((current) => current.filter((item) => item.userId !== event.userId));
                    timeouts.delete(event.userId);
                }, 4000);
                timeouts.set(event.userId, timeout);
            }
        }

        function handleIncomingMessage(event: { partyCode: string; clientId?: string }) {
            if (event.partyCode !== code || !event.clientId) return;
            removePending(event.clientId);
        }

        socket.on("chat:typing", handleTyping);
        socket.on("chat:message", handleIncomingMessage);

        return () => {
            socket.off("chat:typing", handleTyping);
            socket.off("chat:message", handleIncomingMessage);
            timeouts.forEach((timeout) => clearTimeout(timeout));
            timeouts.clear();
        };
    }, [code, removePending, socket, user?.id]);

    useEffect(() => {
        if (!socket) return;

        if (!draft.trim()) {
            if (typingSentRef.current) {
                socket.emit("chat:typing", { partyCode: code!, isTyping: false });
                typingSentRef.current = false;
            }
            return;
        }

        if (!typingSentRef.current) {
            socket.emit("chat:typing", { partyCode: code!, isTyping: true });
            typingSentRef.current = true;
        }

        const timeout = setTimeout(() => {
            socket.emit("chat:typing", { partyCode: code!, isTyping: false });
            typingSentRef.current = false;
        }, 2500);

        return () => clearTimeout(timeout);
    }, [code, draft, socket]);

    useEffect(
        () => () => {
            if (typingSentRef.current && socket) {
                socket.emit("chat:typing", { partyCode: code!, isTyping: false });
                typingSentRef.current = false;
            }
            pendingTimeouts.current.forEach((timeout) => clearTimeout(timeout));
            pendingTimeouts.current.clear();
        },
        [code, socket],
    );

    function handleSend() {
        const content = draft.trim();
        if (!content) return;

        if (editingMessage) {
            if (!socket || !connected) {
                showToast({ title: "Not connected", description: "Wait for the connection and try again.", variant: "warning" });
                return;
            }

            socket.emit("chat:edit", { messageId: editingMessage.id, content }, (result) => {
                if (result.ok) {
                    applyChatMessageUpdate(queryClient, code!, result.message);
                    setEditingMessage(null);
                    setDraft("");
                } else {
                    showToast({ title: "Could not edit message", description: result.error, variant: "error" });
                }
            });
            return;
        }

        const clientId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setPending((current) => [{ clientId, content, createdAt: new Date().toISOString(), status: "sending" }, ...current]);
        setDraft("");
        sendMessage(clientId, content);
    }

    function retryPending(message: PendingMessage) {
        setPending((current) => current.map((item) => (item.clientId === message.clientId ? { ...item, status: "sending" } : item)));
        sendMessage(message.clientId, message.content);
    }

    function cancelEdit() {
        setEditingMessage(null);
        setDraft("");
    }

    function handleDelete(message: ChatMessage) {
        setActionMessage(null);
        showConfirmDialog({
            destructive: true,
            confirmLabel: "Delete",
            title: "Delete message?",
            description: "This cannot be undone.",
            onConfirm: () => {
                if (!socket || !connected) {
                    showToast({ title: "Not connected", description: "Wait for the connection and try again.", variant: "warning" });
                    return;
                }

                socket.emit("chat:delete", { messageId: message.id }, (result) => {
                    if (result.ok) {
                        applyChatMessageDelete(queryClient, code!, message.id);
                        if (editingMessage?.id === message.id) cancelEdit();
                    } else {
                        showToast({ title: "Could not delete message", description: result.error, variant: "error" });
                    }
                });
            },
        });
    }

    function handleEdit(message: ChatMessage) {
        setActionMessage(null);
        setEditingMessage(message);
        setDraft(message.content);
    }

    function handleLongPress(message: ChatMessage) {
        if (message.senderId !== user?.id) return;
        setActionMessage(message);
    }

    function scrollToBottom() {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        setLocalUnreadCount(0);
        setConversationUnread(queryClient, code!, 0);
        markRead();
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <SafeAreaView style={{ backgroundColor: color.background, flex: 1 }} edges={["top"]}>
                <View className="border-foreground flex-row items-center gap-3 border-b-2 px-4 py-3">
                    <Pressable onPress={() => router.back()} className="border-foreground bg-card shadow-nb-sm size-10 items-center justify-center border-2">
                        <ChevronLeft size={20} color={color.foreground} strokeWidth={2.5} />
                    </Pressable>

                    <Pressable onPress={() => router.push({ pathname: "/(app)/(tabs)/(party)/[code]", params: { code } })} className="flex-1">
                        <Text className="font-jakarta-extrabold text-lg" numberOfLines={1}>
                            {party?.name ?? "Party chat"}
                        </Text>
                        <View className="flex-row items-center gap-1.5">
                            <View className={cn("border-foreground size-2 rounded-full border", onlineCount > 0 ? "bg-lime" : "bg-muted")} />
                            <Text className="text-muted-foreground font-jakarta-bold text-[10px] tracking-widest uppercase">{onlineCount > 0 ? `${onlineCount} online` : "No one online"}</Text>
                        </View>
                    </Pressable>
                </View>

                {messagesQuery.isLoading ? (
                    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                        <SkeletonChatRoom count={12} />
                    </ScrollView>
                ) : (
                    <View style={{ flex: 1 }}>
                        <FlatList
                            inverted
                            data={listData}
                            ref={flatListRef}
                            style={{ flex: 1 }}
                            keyExtractor={(item) => (item.type === "message" ? item.message.id : item.type === "pending" ? item.pending.clientId : `date-${item.date}`)}
                            contentContainerStyle={{ gap: 10, paddingHorizontal: 16, paddingVertical: 16, flexGrow: 1 }}
                            showsVerticalScrollIndicator={false}
                            keyboardDismissMode="on-drag"
                            keyboardShouldPersistTaps="handled"
                            onScroll={onScroll}
                            scrollEventThrottle={100}
                            onEndReached={() => {
                                if (messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage) void messagesQuery.fetchNextPage();
                            }}
                            onEndReachedThreshold={0.5}
                            renderItem={({ item }: { item: ChatListItem }) => {
                                // Date separator
                                if (item.type === "dateSeparator") {
                                    return (
                                        <View className="flex-row items-center gap-3 py-2">
                                            <View className="border-muted flex-1 h-px" />
                                            <View className="border-foreground bg-card shadow-nb-sm border-2 px-3 py-1">
                                                <Text className="text-muted-foreground font-jakarta-bold text-[10px] tracking-widest uppercase">
                                                    {formatDateSeparator(item.date)}
                                                </Text>
                                            </View>
                                            <View className="border-muted flex-1 h-px" />
                                        </View>
                                    );
                                }

                                const message = item.type === "message" ? item.message : null;
                                const pendingMessage = item.type === "pending" ? item.pending : null;
                                const isMine = message ? message.senderId === user?.id : true;
                                const content = message?.content ?? pendingMessage?.content ?? "";
                                const createdAt = message?.createdAt ?? pendingMessage?.createdAt ?? new Date().toISOString();
                                const senderName = message?.sender.name ?? userQuery.data?.name ?? "You";
                                const isFailed = pendingMessage?.status === "failed";

                                return (
                                    <View className={cn("max-w-[82%] gap-1", isMine ? "items-end self-end" : "items-start self-start")}>
                                        {!isMine && <Text className="text-muted-foreground font-jakarta-bold text-[10px]">{senderName}</Text>}

                                        <Pressable
                                            delayLongPress={350}
                                            onPress={isFailed ? () => retryPending(pendingMessage) : undefined}
                                            onLongPress={message ? () => handleLongPress(message) : pendingMessage ? () => removePending(pendingMessage.clientId) : undefined}
                                            className={cn("border-foreground shadow-nb-sm border-2 px-3 py-2", isMine ? "bg-lime" : "bg-card", isFailed && "border-destructive", pendingMessage?.status === "sending" && "opacity-70")}
                                        >
                                            <Text className={cn("font-jakarta-semibold text-sm", isMine ? "text-black" : "text-foreground")}>{content}</Text>
                                        </Pressable>

                                        <View className="flex-row items-center gap-1.5">
                                            <Text className="text-muted-foreground font-jakarta-bold text-[9px]">{formatMessageTime(createdAt)}</Text>
                                            {message?.editedAt ? <Text className="text-muted-foreground font-jakarta-bold text-[9px]">edited</Text> : null}
                                            {pendingMessage?.status === "sending" ? <ActivityIndicator size="small" color={color.mutedForeground} /> : null}
                                            {isFailed ? <Text className="text-destructive font-jakarta-bold text-[9px]">Tap to retry</Text> : null}
                                        </View>
                                    </View>
                                );
                            }}
                            ListFooterComponent={
                                messagesQuery.isFetchingNextPage ? (
                                    <View className="items-center py-3">
                                        <ActivityIndicator />
                                    </View>
                                ) : !messagesQuery.hasNextPage && listData.length > 0 ? (
                                    <View className="items-center py-3">
                                        <Text className="text-muted-foreground font-jakarta-bold text-[10px] tracking-widest uppercase">Start of conversation</Text>
                                    </View>
                                ) : undefined
                            }
                            ListEmptyComponent={
                                <View className="flex-1 justify-center py-8" style={{ transform: [{ scaleY: -1 }] }}>
                                    <EmptyState icon={MessageCircle} title="No messages yet" description="Say hello and get the party started." />
                                </View>
                            }
                        />

                        {/* Floating "New Messages" scroll button */}
                        {localUnreadCount > 0 && (
                            <Pressable onPress={scrollToBottom} className="border-foreground shadow-nb-md bg-lime absolute right-4 bottom-4 flex-row items-center gap-1.5 rounded-full border-2 px-3 py-2" style={{ zIndex: 10 }}>
                                <ArrowDown size={16} color="#000" strokeWidth={2.5} />
                                <Text className="font-jakarta-extrabold text-xs text-black">{localUnreadCount}</Text>
                            </Pressable>
                        )}
                    </View>
                )}

                {typingUsers.length > 0 ? (
                    <View className="px-4 pb-1">
                        <Text className="text-muted-foreground font-jakarta-bold text-[10px]">
                            {typingUsers.map((item) => item.name).join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                        </Text>
                    </View>
                ) : null}

                <View className="border-foreground bg-background border-t-2 p-4">
                    {editingMessage ? (
                        <View className="border-foreground bg-amber mb-2 flex-row items-center justify-between gap-2 border-2 px-3 py-2">
                            <View className="flex-1">
                                <Text className="font-jakarta-extrabold text-[10px] tracking-widest uppercase">Editing message</Text>
                                <Text className="font-jakarta-bold text-xs" numberOfLines={1}>
                                    {editingMessage.content}
                                </Text>
                            </View>
                            <Pressable onPress={cancelEdit} hitSlop={8}>
                                <X size={18} color="#000" strokeWidth={2.5} />
                            </Pressable>
                        </View>
                    ) : null}

                    <View className="flex-row items-end gap-2">
                        <TextInput
                            value={draft}
                            onChangeText={setDraft}
                            placeholder={editingMessage ? "Edit your message..." : "Message your party..."}
                            placeholderTextColor={color.mutedForeground}
                            multiline
                            maxLength={2000}
                            className="border-foreground bg-muted text-foreground font-jakarta-semibold max-h-32 min-h-12 flex-1 border-2 px-3 py-3"
                        />

                        <Button size="icon" onPress={handleSend} disabled={!draft.trim()} accessibilityLabel={editingMessage ? "Save message" : "Send message"}>
                            {editingMessage ? <Check size={18} color="#000" strokeWidth={3} /> : <Send size={18} color="#000" strokeWidth={2.5} />}
                        </Button>
                    </View>
                </View>
            </SafeAreaView>

            <MessageActionsDialog message={actionMessage} onEdit={handleEdit} onDelete={handleDelete} onCancel={() => setActionMessage(null)} />
            {confirmDialog}
        </KeyboardAvoidingView>
    );
}
