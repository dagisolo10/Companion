import { applyLeaderboard, applyPartyCodeChange, applyPartyDelete, applyPartyMemberChange, applyPartyUpdate, applyQuestChange, applyQuestCompletion, applyUserUpdate } from "@/lib/socket-cache";
import { applyChatMessage, applyChatMessageDelete, applyChatMessageUpdate, applyChatPresence, applyChatRead } from "@/lib/chat-cache";
import { Dispatch, PropsWithChildren, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import useChatNotificationSound from "@/hooks/custom/use-chat-notification-sound";
import { SocketIoContext, TypedSocket } from "@/contexts/socket.io-context";
import { router, useGlobalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { leavePartyCaches } from "@/lib/query-cache";
import { useAuth } from "@/contexts/auth-context";
import useToast from "@/hooks/custom/use-toast";
import { io } from "socket.io-client";


function messagePreview(content: string) {
    const singleLine = content.replace(/\s+/g, " ").trim();
    return singleLine.length > 80 ? `${singleLine.slice(0, 80)}...` : singleLine;
}

export default function SocketIoProvider({ children }: PropsWithChildren) {
    const [connected, setConnected] = useState(false);
    const [socket, setSocket] = useState<TypedSocket | null>(null);
    const [activeChatCode, setActiveChatCode] = useState<string | null>(null);

    const { token, user } = useAuth();
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const playNotificationSound = useChatNotificationSound();
    const { code: currentPartyCode } = useGlobalSearchParams<{ code?: string }>();

    const socketRef = useRef<Dispatch<SetStateAction<TypedSocket | null>>>(null);
    const partyCodeRef = useRef(currentPartyCode);
    const showToastRef = useRef(showToast);
    const playNotificationSoundRef = useRef(playNotificationSound);
    const activeChatCodeRef = useRef(activeChatCode);
    useEffect(() => {
        socketRef.current = setSocket;
    }, []);
    useEffect(() => {
        partyCodeRef.current = currentPartyCode;
    }, [currentPartyCode]);
    useEffect(() => {
        showToastRef.current = showToast;
    }, [showToast]);
    useEffect(() => {
        playNotificationSoundRef.current = playNotificationSound;
    }, [playNotificationSound]);
    useEffect(() => {
        activeChatCodeRef.current = activeChatCode;
    }, [activeChatCode]);

    useEffect(() => {
        if (!token) {
            socketRef.current?.(null);
            return;
        }

        console.log("🔌 Initializing Socket connection");

        const socketInstance = io(process.env.EXPO_PUBLIC_SERVER_URL, {
            auth: { token },
            autoConnect: true,
            reconnection: true,
            withCredentials: true,
        }) as TypedSocket;

        socketInstance.on("connect", () => {
            setConnected(true);
            console.log("✅ Socket Connected!");
        });

        socketInstance.on("disconnect", (reason) => {
            setConnected(false);
            console.log("❌ Socket Disconnected!", reason);
        });

        socketInstance.on("connect_error", (error) => {
            setConnected(false);
            console.warn("Socket connection attempt failed:", error.message);
        });

        const handleMemberChange = (type: "joined" | "left", event: { member: { id: string; userId: string; partyId: string; joinedAt: string; user: { name: string; username: string } }; partyName: string; partyCode: string; memberCount: number }) => {
            const name = event.member.user.name;
            showToastRef.current({
                title: type === "joined" ? `${name} joined` : `${name} left`,
                description: `@${event.member.user.username} · ${event.partyName}`,
                variant: type === "joined" ? "success" : "warning",
            });
        };
        socketInstance.on("party:member-joined", (event) => {
            handleMemberChange("joined", event);
            applyPartyMemberChange(queryClient, event.partyCode, event.memberCount, event.member, true);
        });
        socketInstance.on("party:member-left", (event) => {
            handleMemberChange("left", event);
            if (event.member.userId === user?.id) {
                void leavePartyCaches(queryClient, event.partyCode, event.memberCount).catch((error: unknown) => {
                    console.error("Failed to clear caches after party removal:", error);
                });
                if (partyCodeRef.current === event.partyCode) router.replace("/(app)/(tabs)/(party)");
                return;
            }
            applyPartyMemberChange(queryClient, event.partyCode, event.memberCount, event.member, false);
        });
        socketInstance.on("party:code-regenerated", (event) => {
            applyPartyCodeChange(queryClient, event.previousCode, event.party, event.memberCount);
            if (partyCodeRef.current === event.previousCode) {
                router.replace({ pathname: "/(app)/(tabs)/(party)/[code]", params: { code: event.party.code } });
            }
        });
        socketInstance.on("party:updated", (event) => applyPartyUpdate(queryClient, event.party, event.memberCount));
        socketInstance.on("party:deleted", (event) => {
            applyPartyDelete(queryClient, event.partyId, event.partyCode);
            if (partyCodeRef.current === event.partyCode) router.replace("/(app)/(tabs)/(party)");
        });
        socketInstance.on("user:updated", (event) => applyUserUpdate(queryClient, event.user));
        socketInstance.on("quest:updated", (event) => applyQuestChange(queryClient, event.quest));
        socketInstance.on("quest:started", (event) => applyQuestChange(queryClient, event.quest));
        socketInstance.on("quest:expiring", (event) => applyQuestChange(queryClient, event.quest));
        socketInstance.on("quest:expired", (event) => applyQuestChange(queryClient, event.quest));
        socketInstance.on("quest:completed", (event) => applyQuestChange(queryClient, event.quest));
        socketInstance.on("quest:created", (event) => applyQuestChange(queryClient, event.quest, true));
        socketInstance.on("quest:member-completed", (event) => applyQuestCompletion(queryClient, event));
        socketInstance.on("party:leaderboard-updated", (event) => applyLeaderboard(queryClient, event.partyCode, event.leaderboard));

        socketInstance.on("chat:message", (event) => {
            // Always apply the message to the cache — the chat room's scroll logic handles marking read
            applyChatMessage(queryClient, event.partyCode, event.message, user?.id, activeChatCodeRef.current);

            // Don't notify for your own messages
            if (event.message.senderId === user?.id) return;

            // Always show toast and play sound for incoming messages from others.
            // If the user is inside the chat and the message is visible, the chat room will mark it as read.
            // If the user is scrolled up, the message stays unread and the notification alerts them.
            playNotificationSoundRef.current();
            showToastRef.current({
                variant: "info",
                title: event.message.sender.name,
                description: messagePreview(event.message.content),
            });
        });
        socketInstance.on("chat:message-updated", (event) => applyChatMessageUpdate(queryClient, event.partyCode, event.message));
        socketInstance.on("chat:message-deleted", (event) => applyChatMessageDelete(queryClient, event.partyCode, event.messageId));
        socketInstance.on("chat:read", (event) => applyChatRead(queryClient, event.partyCode, event.lastReadAt));
        socketInstance.on("chat:presence", (event) => applyChatPresence(queryClient, event));

        socketRef.current?.(socketInstance);

        return () => {
            socketInstance.off("connect");
            socketInstance.off("disconnect");
            socketInstance.off("connect_error");
            socketInstance.off("party:member-joined");
            socketInstance.off("party:member-left");
            socketInstance.off("party:code-regenerated");
            socketInstance.off("party:updated");
            socketInstance.off("party:deleted");
            socketInstance.off("party:leaderboard-updated");
            socketInstance.off("user:updated");
            socketInstance.off("quest:created");
            socketInstance.off("quest:updated");
            socketInstance.off("quest:started");
            socketInstance.off("quest:expiring");
            socketInstance.off("quest:expired");
            socketInstance.off("quest:completed");
            socketInstance.off("quest:member-completed");
            socketInstance.off("chat:message");
            socketInstance.off("chat:message-updated");
            socketInstance.off("chat:message-deleted");
            socketInstance.off("chat:read");
            socketInstance.off("chat:presence");
            socketInstance.disconnect();
            socketRef.current?.((currentSocket) => (currentSocket === socketInstance ? null : currentSocket));
            setConnected(false);
            console.log("🧹 Disconnecting previous socket instance...");
        };
    }, [queryClient, token, user?.id]);

    const handleSetActiveChatCode = useCallback((code: string | null) => setActiveChatCode(code), []);

    return <SocketIoContext.Provider value={{ socket, connected: Boolean(token && connected), activeChatCode, setActiveChatCode: handleSetActiveChatCode }}>{children}</SocketIoContext.Provider>;
}
