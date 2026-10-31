import "expo-sqlite/localStorage/install";

import type { Session } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { supabase } from "@/lib/supabase";
import { Platform } from "react-native";


export type RememberedAccount = {
    userId: string;
    email: string;
    name: string;
};

const ACCOUNTS_KEY = "companion.remembered-accounts.v1";
const REFRESH_TOKEN_KEY_PREFIX = "companion.refresh-token.";

export function getRememberedAccounts(): RememberedAccount[] {
    if (Platform.OS === "web") return [];

    try {
        const raw = globalThis.localStorage.getItem(ACCOUNTS_KEY);
        if (!raw) return [];

        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed.filter((account): account is RememberedAccount => typeof account?.userId === "string" && typeof account.email === "string" && typeof account.name === "string");
    } catch {
        return [];
    }
}

function getAccountSummary(session: Session): RememberedAccount {
    const email = session.user.email ?? "Unknown email";
    const metadataName = session.user.user_metadata?.name;
    return {
        email,
        userId: session.user.id,
        name: typeof metadataName === "string" && metadataName.trim() ? metadataName : email,
    };
}

function saveAccountList(accounts: RememberedAccount[]) {
    globalThis.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export async function rememberAccount(session: Session) {
    if (Platform.OS === "web") throw new Error("Remembered accounts are only available in the mobile app.");

    await SecureStore.setItemAsync(`${REFRESH_TOKEN_KEY_PREFIX}${session.user.id}`, session.refresh_token, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });

    const account = getAccountSummary(session);
    const accounts = getRememberedAccounts();
    saveAccountList([account, ...accounts.filter((saved) => saved.userId !== account.userId)]);
}

export async function updateRememberedAccountSession(session: Session) {
    if (!getRememberedAccounts().some((account) => account.userId === session.user.id)) return;
    await rememberAccount(session);
}

export function getRememberedRefreshToken(userId: string) {
    if (Platform.OS === "web") return Promise.resolve(null);
    return SecureStore.getItemAsync(`${REFRESH_TOKEN_KEY_PREFIX}${userId}`);
}

export async function restoreRememberedAccount(userId: string) {
    const refresh_token = await getRememberedRefreshToken(userId);
    if (!refresh_token) throw new Error("The saved session is no longer available. Sign in again to save this account.");

    const { data, error } = await supabase.auth.refreshSession({ refresh_token });
    if (error) throw error;
    if (!data.session) throw new Error("Could not restore this account. Sign in again to save it.");

    await updateRememberedAccountSession(data.session);
    return data.session;
}

export async function forgetAccount(userId: string) {
    if (Platform.OS !== "web") await SecureStore.deleteItemAsync(`${REFRESH_TOKEN_KEY_PREFIX}${userId}`);
    saveAccountList(getRememberedAccounts().filter((account) => account.userId !== userId));
}
