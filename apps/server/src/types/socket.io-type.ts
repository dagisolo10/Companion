import type { ClientToServerEvents, ServerToClientEvents } from "@companion/shared-types";
import { DefaultEventsMap, Server, Socket } from "socket.io";
import { User } from "@supabase/supabase-js";


export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, { user: User }>;
export type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, { user: User }>;
