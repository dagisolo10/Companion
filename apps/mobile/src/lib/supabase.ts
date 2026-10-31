import "expo-sqlite/localStorage/install";
import "react-native-url-polyfill/auto";

import { createClient } from "@supabase/supabase-js";


const supabaseUrl = process.env["EXPO_PUBLIC_SUPABASE_URL"]!;
const supabasePublishableKey = process.env["EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY"]!;

// Fallback storage for server-side environments (e.g., expo export:embed server manifest generation)
const supabaseStorage: Storage = {
    getItem: (key) => (typeof globalThis.localStorage !== "undefined" ? globalThis.localStorage.getItem(key) : null),
    setItem: (key, value) => {
        if (typeof globalThis.localStorage !== "undefined") globalThis.localStorage.setItem(key, value);
    },
    removeItem: (key) => {
        if (typeof globalThis.localStorage !== "undefined") globalThis.localStorage.removeItem(key);
    },
    get length() {
        return typeof globalThis.localStorage !== "undefined" ? globalThis.localStorage.length : 0;
    },
    key: (index) => (typeof globalThis.localStorage !== "undefined" ? globalThis.localStorage.key(index) : null),
    clear: () => {
        if (typeof globalThis.localStorage !== "undefined") globalThis.localStorage.clear();
    },
};

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
        storage: supabaseStorage,
        persistSession: true,
        autoRefreshToken: false,
        detectSessionInUrl: false,
    },
});
