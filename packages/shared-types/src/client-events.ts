import type { ChatMessage } from "./models.js";

export type ChatSendPayload = {
    partyCode: string;
    content: string;
    clientId: string;
};

export type ChatSendResult = { ok: true; message: ChatMessage; clientId: string } | { ok: false; error: string };

export type ChatEditPayload = {
    messageId: string;
    content: string;
};

export type ChatEditResult = { ok: true; message: ChatMessage } | { ok: false; error: string };

export type ChatDeletePayload = {
    messageId: string;
};

export type ChatDeleteResult = { ok: true; messageId: string; partyCode: string } | { ok: false; error: string };

export type ChatTypingPayload = {
    partyCode: string;
    isTyping: boolean;
};

export type ChatReadPayload = {
    partyCode: string;
};

export type ChatReadResult = { ok: true; lastReadAt: string } | { ok: false; error: string };

export interface ClientToServerEvents {
    "chat:send": (payload: ChatSendPayload, ack: (result: ChatSendResult) => void) => void;
    "chat:edit": (payload: ChatEditPayload, ack: (result: ChatEditResult) => void) => void;
    "chat:delete": (payload: ChatDeletePayload, ack: (result: ChatDeleteResult) => void) => void;
    "chat:typing": (payload: ChatTypingPayload) => void;
    "chat:read": (payload: ChatReadPayload, ack: (result: ChatReadResult) => void) => void;
}
