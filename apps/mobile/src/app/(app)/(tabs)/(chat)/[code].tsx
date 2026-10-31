import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, TextInput, View } from "react-native";
import { applyChatMessage, applyChatMessageDelete, applyChatMessageUpdate, applyChatRead } from "@/lib/chat-cache";
import { useGetChatMessagesInfinite, useGetChatPresence } from "@/hooks/tan-stack/chat";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, ChevronLeft, MessageCircle, Send, X } from "lucide-react-native";
import type { ChatMessage, ChatTypingEvent } from "@companion/shared-types";
import MessageActionsDialog from "@/components/chat/message-actions-dialog";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useConfirmDialog from "@/hooks/custom/use-confirm-dialog";
import { useSocketIo } from "@/contexts/socket.io-context";
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


type PendingMessage = {
    clientId: string;
    content: string;
    createdAt: string;
    status: "sending" | "failed";
};

type ChatListItem = { type: "message"; message: ChatMessage } | { type: "pending"; pending: PendingMessage };

const ACK_TIMEOUT_MS = 15000;

function formatMessageTime(date: string) {
    return new Date(date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function ChatRoomScreen() {
    const { code } = useLocalSearchParams<{ code: string }>();
    const color = useColor();
    const insets = useSafeAreaInsets();
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

    const pendingTimeouts = useRef(new Map<string, ReturnType<typeof setTimeout>>());
    const typingTimeouts = useRef(new Map<string, ReturnType<typeof setTimeout>>());
    const typingSentRef = useRef(false);

    const messages = messagesQuery.data;
    const party = partyQuery.data;
    const onlineCount = presenceQuery.data.onlineUserIds.length;

    const listData = useMemo<ChatListItem[]>(() => [...pending.map((item) => ({ type: "pending" as const, pending: item })), ...messages.map((message) => ({ type: "message" as const, message }))], [messages, pending]);

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

    const markRead = useCallback(() => {
        if (!socket || !connected) return;

        socket.emit("chat:read", { partyCode: code! }, (result) => {
            if (result.ok) applyChatRead(queryClient, code!, result.lastReadAt);
        });
    }, [code, connected, queryClient, socket]);

    useEffect(() => {
        markRead();
    }, [markRead]);

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

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <SafeAreaView style={{ backgroundColor: color.background, flex: 1 }} edges={["top"]}>
                <View className="border-foreground flex-row items-center gap-3 border-b-2 px-4 py-3">
                    <Pressable onPress={() => router.back()} className="border-foreground bg-card shadow-nb-sm size-10 items-center justify-center border-2">
                        <ChevronLeft size={20} color={color.foreground} strokeWidth={2.5} />
                    </Pressable>

                    <View className="flex-1">
                        <Text className="text-lg font-extrabold" numberOfLines={1}>
                            {party?.name ?? "Party chat"}
                        </Text>
                        <View className="flex-row items-center gap-1.5">
                            <View className={cn("border-foreground size-2 rounded-full border", onlineCount > 0 ? "bg-lime" : "bg-muted")} />
                            <Text className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">{onlineCount > 0 ? `${onlineCount} online` : "No one online"}</Text>
                        </View>
                    </View>
                </View>

                {messagesQuery.isLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator />
                    </View>
                ) : (
                    <FlatList
                        inverted
                        style={{ flex: 1 }}
                        data={listData}
                        keyExtractor={(item) => (item.type === "message" ? item.message.id : item.pending.clientId)}
                        contentContainerStyle={{ gap: 10, paddingHorizontal: 16, paddingVertical: 16, flexGrow: 1 }}
                        showsVerticalScrollIndicator={false}
                        keyboardDismissMode="on-drag"
                        keyboardShouldPersistTaps="handled"
                        onEndReached={() => {
                            if (messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage) void messagesQuery.fetchNextPage();
                        }}
                        onEndReachedThreshold={0.5}
                        renderItem={({ item }) => {
                            const message = item.type === "message" ? item.message : null;
                            const pendingMessage = item.type === "pending" ? item.pending : null;
                            const isMine = message ? message.senderId === user?.id : true;
                            const content = message?.content ?? pendingMessage?.content ?? "";
                            const createdAt = message?.createdAt ?? pendingMessage?.createdAt ?? new Date().toISOString();
                            const senderName = message?.sender.name ?? userQuery.data?.name ?? "You";
                            const isFailed = pendingMessage?.status === "failed";

                            return (
                                <View className={cn("max-w-[82%] gap-1", isMine ? "items-end self-end" : "items-start self-start")}>
                                    {!isMine && <Text className="text-muted-foreground text-[10px] font-bold">{senderName}</Text>}

                                    <Pressable
                                        delayLongPress={350}
                                        onPress={isFailed ? () => retryPending(pendingMessage) : undefined}
                                        onLongPress={message ? () => handleLongPress(message) : pendingMessage ? () => removePending(pendingMessage.clientId) : undefined}
                                        className={cn("border-foreground shadow-nb-sm border-2 px-3 py-2", isMine ? "bg-lime" : "bg-card", isFailed && "border-destructive", pendingMessage?.status === "sending" && "opacity-70")}
                                    >
                                        <Text className={cn("text-sm font-semibold", isMine ? "text-black" : "text-foreground")}>{content}</Text>
                                    </Pressable>

                                    <View className="flex-row items-center gap-1.5">
                                        <Text className="text-muted-foreground text-[9px] font-bold">{formatMessageTime(createdAt)}</Text>
                                        {message?.editedAt ? <Text className="text-muted-foreground text-[9px] font-bold">edited</Text> : null}
                                        {pendingMessage?.status === "sending" ? <ActivityIndicator size="small" color={color.mutedForeground} /> : null}
                                        {isFailed ? <Text className="text-destructive text-[9px] font-bold">Tap to retry</Text> : null}
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
                                    <Text className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">Start of conversation</Text>
                                </View>
                            ) : undefined
                        }
                        ListEmptyComponent={
                            <View className="flex-1 justify-center py-8" style={{ transform: [{ scaleY: -1 }] }}>
                                <EmptyState icon={MessageCircle} title="No messages yet" description="Say hello and get the party started." />
                            </View>
                        }
                    />
                )}

                {typingUsers.length > 0 ? (
                    <View className="px-4 pb-1">
                        <Text className="text-muted-foreground text-[10px] font-bold">
                            {typingUsers.map((item) => item.name).join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                        </Text>
                    </View>
                ) : null}

                <View className="border-foreground bg-background border-t-2 px-4 pt-2" style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
                    {editingMessage ? (
                        <View className="border-foreground bg-amber mb-2 flex-row items-center justify-between gap-2 border-2 px-3 py-2">
                            <View className="flex-1">
                                <Text className="text-[10px] font-extrabold tracking-widest uppercase">Editing message</Text>
                                <Text className="text-xs font-bold" numberOfLines={1}>
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
                            className="border-foreground bg-muted text-foreground max-h-32 min-h-12 flex-1 border-2 px-3 py-3 font-semibold"
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
