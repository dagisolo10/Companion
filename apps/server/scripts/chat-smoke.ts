import type { ChatDeleteResult, ChatEditResult, ChatMessageDeletedEvent, ChatMessageEvent, ChatPresence, ChatSendResult, ChatTypingEvent, Party, User } from "@companion/shared-types";
import type { ClientToServerEvents, ServerToClientEvents } from "@companion/shared-types";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { io, type Socket } from "socket.io-client";
import "dotenv/config";

const SERVER_URL = process.env["SMOKE_SERVER_URL"] ?? process.env["SERVER_URL"] ?? "http://127.0.0.1:3000";
const TIMEOUT_MS = 5000;

type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
type RawSocket = {
    on: (event: string, listener: (payload: unknown) => void) => void;
    off: (event: string, listener: (payload: unknown) => void) => void;
};

function delay(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function assert(condition: unknown, message: string): asserts condition {
    if (!condition) throw new Error(message);
}

async function api<T>(path: string, token: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);
    if (init.body) headers.set("Content-Type", "application/json");

    const response = await fetch(`${SERVER_URL}${path}`, { ...init, headers });
    const text = await response.text();
    const data = text ? (JSON.parse(text) as unknown) : undefined;

    if (!response.ok) {
        throw new Error(`${init.method ?? "GET"} ${path} failed (${response.status}): ${text}`);
    }

    return data as T;
}

function connect(token: string) {
    return new Promise<ChatSocket>((resolve, reject) => {
        const socket: ChatSocket = io(SERVER_URL, {
            auth: { token },
            reconnection: false,
            timeout: TIMEOUT_MS,
            transports: ["websocket"],
        });

        const timer = setTimeout(() => {
            socket.disconnect();
            reject(new Error("Socket connection timed out"));
        }, TIMEOUT_MS);

        socket.once("connect", () => {
            clearTimeout(timer);
            resolve(socket);
        });

        socket.once("connect_error", (error) => {
            clearTimeout(timer);
            socket.disconnect();
            reject(error);
        });
    });
}

function waitForEvent<Payload>(socket: ChatSocket, event: string, predicate?: (payload: Payload) => boolean, timeoutMs = TIMEOUT_MS) {
    const rawSocket = socket as unknown as RawSocket;

    return new Promise<Payload>((resolve, reject) => {
        const handler = (payload: unknown) => {
            const typed = payload as Payload;

            if (predicate && !predicate(typed)) return;

            clearTimeout(timer);
            rawSocket.off(event, handler);
            resolve(typed);
        };

        const timer = setTimeout(() => {
            rawSocket.off(event, handler);
            reject(new Error(`Timed out waiting for "${event}"`));
        }, timeoutMs);

        rawSocket.on(event, handler);
    });
}

function sendChat(socket: ChatSocket, payload: { partyCode: string; content: string; clientId: string }) {
    return new Promise<ChatSendResult>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("chat:send timed out")), TIMEOUT_MS);
        socket.emit("chat:send", payload, (result) => {
            clearTimeout(timer);
            resolve(result);
        });
    });
}

function sendRawChat(socket: ChatSocket, args: unknown[]) {
    return new Promise<ChatSendResult>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("chat:send timed out")), TIMEOUT_MS);
        const rawSocket = socket as unknown as { emit: (event: string, ...args: unknown[]) => void };
        rawSocket.emit("chat:send", ...args, (result: ChatSendResult) => {
            clearTimeout(timer);
            resolve(result);
        });
    });
}

function editChat(socket: ChatSocket, payload: { messageId: string; content: string }) {
    return new Promise<ChatEditResult>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("chat:edit timed out")), TIMEOUT_MS);
        socket.emit("chat:edit", payload, (result) => {
            clearTimeout(timer);
            resolve(result);
        });
    });
}

function deleteChat(socket: ChatSocket, payload: { messageId: string }) {
    return new Promise<ChatDeleteResult>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("chat:delete timed out")), TIMEOUT_MS);
        socket.emit("chat:delete", payload, (result) => {
            clearTimeout(timer);
            resolve(result);
        });
    });
}

async function waitForPresence(code: string, token: string, expectedUserIds: string[]) {
    const deadline = Date.now() + TIMEOUT_MS;
    let lastPresence: ChatPresence | undefined;

    while (Date.now() < deadline) {
        lastPresence = await api<ChatPresence>(`/chat/${code}/presence`, token);

        if (expectedUserIds.every((userId) => lastPresence?.onlineUserIds.includes(userId))) {
            return lastPresence;
        }

        await delay(100);
    }

    throw new Error(`Presence did not include all users. Last response: ${JSON.stringify(lastPresence)}`);
}

async function main() {
    const tokenA = "skip-auth:smoke-a";
    const tokenB = "skip-auth:smoke-b";

    console.log(`Chat smoke test against ${SERVER_URL}`);

    const [userA, userB] = await Promise.all([api<User>("/user", tokenA), api<User>("/user", tokenB)]);
    assert(userA.id !== userB.id, "Smoke users should be different");

    const party = await api<Party>("/party/create", tokenA, {
        method: "POST",
        body: JSON.stringify({ name: `Chat smoke ${new Date().toISOString()}`, public: false }),
    });

    console.log(`Created party ${party.code} as ${userA.username}`);

    const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env["DATABASE_URL"] }) });
    const sockets: ChatSocket[] = [];

    try {
        await api(`/party-member/join/${party.code}`, tokenB, { method: "POST" });
        console.log(`Joined as ${userB.username}`);

        const [socketA, socketB] = await Promise.all([connect(tokenA), connect(tokenB)]);
        sockets.push(socketA, socketB);

        const presence = await waitForPresence(party.code, tokenA, [userA.id, userB.id]);
        console.log(`Presence verified: ${presence.onlineUserIds.length} online`);

        const content = `hello ${Date.now()}`;
        const incoming = waitForEvent<ChatMessageEvent>(socketA, "chat:message", (event) => event.partyCode === party.code && event.message.content === content);
        const sendResult = await sendChat(socketB, { partyCode: party.code, content, clientId: `smoke-${Date.now()}` });

        assert(sendResult.ok, `chat:send failed: ${sendResult.ok ? "" : sendResult.error}`);

        const received = await incoming;
        assert(received.message.id === sendResult.message.id, "Received message id should match the ack id");
        console.log("Message send/receive verified");

        const wrappedContent = `wrapped ${Date.now()}`;
        const wrappedIncoming = waitForEvent<ChatMessageEvent>(socketA, "chat:message", (event) => event.partyCode === party.code && event.message.content === wrappedContent);
        const wrappedResult = await sendRawChat(socketB, [
            [{ partyCode: party.code, content: wrappedContent, clientId: `wrapped-${Date.now()}` }],
        ]);

        assert(wrappedResult.ok, `array-wrapped chat:send failed: ${wrappedResult.ok ? "" : wrappedResult.error}`);
        await wrappedIncoming;
        console.log("Array-wrapped payload verified");

        const typing = waitForEvent<ChatTypingEvent>(socketB, "chat:typing", (event) => event.partyCode === party.code && event.userId === userA.id && event.isTyping);
        socketA.emit("chat:typing", { partyCode: party.code, isTyping: true });
        await typing;
        console.log("Typing indicator verified");

        const editedContent = `${content} (edited)`;
        const update = waitForEvent<ChatMessageEvent>(socketA, "chat:message-updated", (event) => event.message.id === sendResult.message.id);
        const editResult = await editChat(socketB, { messageId: sendResult.message.id, content: editedContent });

        assert(editResult.ok, `chat:edit failed: ${editResult.ok ? "" : editResult.error}`);

        const updated = await update;
        assert(updated.message.content === editedContent, "Message content should be updated");
        console.log("Message edit verified");

        const deletion = waitForEvent<ChatMessageDeletedEvent>(socketA, "chat:message-deleted", (event) => event.messageId === sendResult.message.id);
        const deleteResult = await deleteChat(socketB, { messageId: sendResult.message.id });

        assert(deleteResult.ok, `chat:delete failed: ${deleteResult.ok ? "" : deleteResult.error}`);
        await deletion;
        console.log("Message delete verified");

        const read = await api<{ partyCode: string; lastReadAt: string }>(`/chat/${party.code}/read`, tokenA, { method: "POST" });
        assert(read.partyCode === party.code, "Read receipt party code mismatch");
        console.log("Read receipt verified");

        console.log("✅ Chat smoke test passed");
    } finally {
        for (const socket of sockets) socket.disconnect();

        await prisma.chatMessage.deleteMany({ where: { partyId: party.id } });
        await prisma.partyChatRead.deleteMany({ where: { partyId: party.id } });
        await prisma.partyMember.deleteMany({ where: { partyId: party.id } });
        await prisma.party.deleteMany({ where: { id: party.id } });
        await prisma.$disconnect();

        console.log("🧹 Cleaned up smoke party");
    }
}

main().catch((error: unknown) => {
    console.error("❌ Chat smoke test failed", error);
    process.exitCode = 1;
});
