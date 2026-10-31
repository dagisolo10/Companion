import { ClientToServerEvents, ServerToClientEvents } from "@companion/shared-types";
import { createContext, useContext } from "react";
import { Socket } from "socket.io-client";

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

type SocketIoContextType = {
    socket: TypedSocket | null;
    connected: boolean;
    activeChatCode: string | null;
    setActiveChatCode: (code: string | null) => void;
};

export const SocketIoContext = createContext<SocketIoContextType>({
    socket: null,
    connected: false,
    activeChatCode: null,
    setActiveChatCode: () => undefined,
});

export function useSocketIo() {
    const context = useContext(SocketIoContext);

    return context;
}
