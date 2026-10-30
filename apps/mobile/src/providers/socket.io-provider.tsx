import { Dispatch, PropsWithChildren, SetStateAction, useEffect, useRef, useState } from "react";
import { SocketIoContext, TypedSocket } from "@/contexts/socket.io-context";
import { useAuth } from "@/contexts/auth-context";
import { io } from "socket.io-client";


export default function SocketIoProvider({ children }: PropsWithChildren) {
    const [connected, setConnected] = useState(false);
    const [socket, setSocket] = useState<TypedSocket | null>(null);

    const { token } = useAuth();

    const socketRef = useRef<Dispatch<SetStateAction<TypedSocket | null>>>(null);
    useEffect(() => {
        socketRef.current = setSocket;
    }, []);

    useEffect(() => {
        if (!token) return;

        console.log("🔌 Initializing Socket connection");

        const socketInstance = io(process.env.EXPO_PUBLIC_SERVER_URL, {
            auth: { token },
            autoConnect: true,
            reconnection: true,
            withCredentials: true,
            transports: ["websocket"],
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
            console.error("❌ Socket Connect Error:", error.message);
        });

        socketInstance.on("connection_error", (error) => {
            setConnected(false);
            console.error("❌ Socket Connection Error:", error);
        });

        socketRef.current?.(socketInstance);

        return () => {
            socketInstance.disconnect();
            socketInstance.off("connect");
            socketInstance.off("disconnect");
            socketInstance.off("connect_error");
            socketInstance.off("connection_error");
            console.log("🧹 Disconnecting previous socket instance...");
        };
    }, [token]);

    return <SocketIoContext.Provider value={{ socket, connected }}>{children}</SocketIoContext.Provider>;
}
