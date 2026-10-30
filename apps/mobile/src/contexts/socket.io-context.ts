import { ClientToServerEvents, ServerToClientEvents } from "@companion/shared-types";
import { createContext, useContext } from "react";
import { Socket } from "socket.io-client";

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

type SocketIoContextType = {
    socket: TypedSocket | null;
    connected: boolean;
};

export const SocketIoContext = createContext<SocketIoContextType>({
    socket: null,
    connected: false,
});

export function useSocketIo() {
    const context = useContext(SocketIoContext);

    return context;
}
