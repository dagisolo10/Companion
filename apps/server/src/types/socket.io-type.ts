import type { ClientToServerEvents, ServerToClientEvents } from "@companion/shared-types";
import { DefaultEventsMap, Server, Socket } from "socket.io";


export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, { userId: string }>;
export type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, { userId: string }>;
