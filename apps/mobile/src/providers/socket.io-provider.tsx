import { applyLeaderboard, applyPartyCodeChange, applyPartyDelete, applyPartyMemberChange, applyPartyUpdate, applyQuestChange, applyQuestCompletion, applyUserUpdate } from "@/lib/socket-cache";
import { Dispatch, PropsWithChildren, SetStateAction, useEffect, useRef, useState } from "react";
import { SocketIoContext, TypedSocket } from "@/contexts/socket.io-context";
import { router, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import useToast from "@/hooks/custom/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { io } from "socket.io-client";


export default function SocketIoProvider({ children }: PropsWithChildren) {
    const [connected, setConnected] = useState(false);
    const [socket, setSocket] = useState<TypedSocket | null>(null);

    const { token } = useAuth();
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const { code: currentPartyCode } = useLocalSearchParams<{ code?: string }>();

    const socketRef = useRef<Dispatch<SetStateAction<TypedSocket | null>>>(null);
    const partyCodeRef = useRef(currentPartyCode);
    useEffect(() => {
        socketRef.current = setSocket;
    }, []);
    useEffect(() => {
        partyCodeRef.current = currentPartyCode;
    }, [currentPartyCode]);

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
            showToast({
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
            socketInstance.disconnect();
            socketRef.current?.((currentSocket) => (currentSocket === socketInstance ? null : currentSocket));
            setConnected(false);
            console.log("🧹 Disconnecting previous socket instance...");
        };
    }, [queryClient, showToast, token]);

    return (
        <SocketIoContext.Provider value={{ socket, connected: Boolean(token && connected) }}>
            {children}
        </SocketIoContext.Provider>
    );
}
